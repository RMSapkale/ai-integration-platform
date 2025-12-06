package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
)

func main() {
	fmt.Println("AI Integration Platform - Runtime Engine v0.1")
	
	worker := NewWorker("worker-1")
	
	// Read job from file (Mock Queue)
	data, err := os.ReadFile("jobs.json")
	if err != nil {
		log.Fatalf("Failed to read jobs.json: %v", err)
	}
	
	var job Job
	if err := json.Unmarshal(data, &job); err != nil {
		log.Fatalf("Failed to parse job: %v", err)
	}

	log.Printf("Received job: %s", job.Name)
	if err := worker.Process(context.Background(), job); err != nil {
		log.Fatalf("Job failed: %v", err)
	}
}
