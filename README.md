# fox-log

A program that generate and consumes an actively written-to w3c-formatted HTTP access log.

Every 10 seconds this program displays statistics about the traffic during those 10 seconds:<br/>
• Sections of the web site that are the most visited.<br/>
• Error rates by sections.

Whenever total traffic for the past 2 minutes exceeds a certain number on average, add a message saying that:<br/>
• High traffic generated an alert - hits = {value}<br/>
Exemple : <br/>
```
[2020-03-03T22:35:08.904] [WARN ] [LOG MONITOR] - High traffic generated an alert - hits = 12
```

Whenever the total traffic drops again below that value on average for the past 2 minutes, another message is displayed detailing when the alert recovered.<br/>
Exemple : <br/>
```
[2020-03-03T22:35:08.904] [INFO ] [LOG MONITOR] - Traffic is back to normal - at = 7 🥳😺
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

```
Node.js v10.19.0 or higher
```

### Installing

To install all the dependencies

```
$ npm install
```

To run the project, there is two steps.
The first one is to run the log generator that will generate random log lines

```
$ npm run generate
```

And to run the monitor

```
$ npm run generate
```

## Running the tests

To run the automated tests

```
$ npm test
```


## Author

* **Mouad SALHI** - *Initial work* - [😺](https://github.com/morfems)

## License

ISC

