package main

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"strings"

	_ "github.com/lib/pq"
)

type DBSource struct {
	Config SourceConfig
}

func NewDBSource(config SourceConfig) *DBSource {
	return &DBSource{Config: config}
}

// StreamQuery executes the query and streams the results as CSV-like format
func (s *DBSource) StreamQuery() (io.Reader, error) {
	log.Printf("Connecting to Database: %s", s.Config.ConnStr)

	db, err := sql.Open("postgres", s.Config.ConnStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open db: %w", err)
	}
	
	rows, err := db.Query(s.Config.Query)
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	return &DBReader{db: db, rows: rows, firstRow: true}, nil
}

// DBReader implements io.Reader to stream rows as CSV
type DBReader struct {
	db       *sql.DB
	rows     *sql.Rows
	buffer   []byte
	firstRow bool
	closed   bool
}

func (r *DBReader) Read(p []byte) (n int, err error) {
	if len(r.buffer) > 0 {
		n = copy(p, r.buffer)
		r.buffer = r.buffer[n:]
		return n, nil
	}

	if r.closed {
		return 0, io.EOF
	}

	if !r.rows.Next() {
		r.close()
		return 0, io.EOF
	}

	// Get columns for header if first row
	if r.firstRow {
		cols, err := r.rows.Columns()
		if err != nil {
			return 0, err
		}
		header := strings.Join(cols, ",") + "\n"
		r.buffer = append(r.buffer, []byte(header)...)
		r.firstRow = false
	}

	// Scan values
	cols, _ := r.rows.Columns()
	values := make([]interface{}, len(cols))
	valuePtrs := make([]interface{}, len(cols))
	for i := range values {
		valuePtrs[i] = &values[i]
	}

	if err := r.rows.Scan(valuePtrs...); err != nil {
		return 0, err
	}

	// Convert to CSV line
	var lineParts []string
	for _, v := range values {
		var strVal string
		if v == nil {
			strVal = ""
		} else {
			strVal = fmt.Sprintf("%v", v)
		}
		lineParts = append(lineParts, strVal)
	}
	line := strings.Join(lineParts, ",") + "\n"
	r.buffer = append(r.buffer, []byte(line)...)

	// Copy to p
	n = copy(p, r.buffer)
	r.buffer = r.buffer[n:]
	return n, nil
}

func (r *DBReader) close() {
	if !r.closed {
		r.rows.Close()
		r.db.Close()
		r.closed = true
	}
}
