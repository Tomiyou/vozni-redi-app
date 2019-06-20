package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const chars = "abcčdefghijklmnoprsštuvzž"

type DataResponse struct {
	DepartureStations []Station
	Error             string
	ErrorMsg          string
}
type Station struct {
	JPOS_IJPP int
	POS_NAZ   string
}

func main() {
	// read url from stdin
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Enter url: ")
	url, _ := reader.ReadString('\n')
	url = url[0 : strings.LastIndex(url, "=")+1]

	// make the request
	var stations []Station
	for i, a := range chars {
		if i > 2 {
			break
		}
		for j, b := range chars {
			if j > 2 {
				break
			}
			data, err := get(fmt.Sprintf("%s%c%c", url, a, b))
			if err != nil {
				log.Fatalln(err)
			}

			for _, item := range data {
				stations = append(stations, item.DepartureStations...)
			}

			time.Sleep(150 * time.Millisecond)
		}
	}

	file, err := os.Create("avtobusne_postaje.json")
	if err != nil {
		log.Fatalln(err)
	}

	defer file.Close()

	json.NewEncoder(file).Encode(stations)
}

func get(url string) (data []DataResponse, err error) {
	resp, err := http.Get(url)
	if err != nil {
		log.Fatalln(err)
	}

	defer resp.Body.Close()

	json.NewDecoder(resp.Body).Decode(&data)

	return
}
