package main

import (
	"fmt"
	"io"
	"log"

	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

type SFTPSink struct {
	Config DestinationConfig
}

func NewSFTPSink(config DestinationConfig) *SFTPSink {
	return &SFTPSink{Config: config}
}

func (s *SFTPSink) WriteFromStream(reader io.Reader) error {
	log.Printf("Connecting to SFTP: %s@%s", s.Config.User, s.Config.Host)

	// 1. SSH Config
	sshConfig := &ssh.ClientConfig{
		User: s.Config.User,
		Auth: []ssh.AuthMethod{
			ssh.Password(s.Config.Auth["password"]),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // For POC only
	}

	// 2. Connect SSH
	conn, err := ssh.Dial("tcp", s.Config.Host, sshConfig)
	if err != nil {
		return fmt.Errorf("failed to dial ssh: %w", err)
	}
	defer conn.Close()

	// 3. Create SFTP Client
	client, err := sftp.NewClient(conn)
	if err != nil {
		return fmt.Errorf("failed to create sftp client: %w", err)
	}
	defer client.Close()

	// 4. Create Remote File
	dstFile, err := client.Create(s.Config.Path)
	if err != nil {
		return fmt.Errorf("failed to create remote file: %w", err)
	}
	defer dstFile.Close()

	// 5. Stream Data
	log.Printf("Streaming data to %s...", s.Config.Path)
	n, err := io.Copy(dstFile, reader)
	if err != nil {
		return fmt.Errorf("failed to stream data: %w", err)
	}

	log.Printf("Successfully transferred %d bytes to SFTP", n)
	return nil
}
