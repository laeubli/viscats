viscats
=======

Visualises human translation processes in recorded translation sessions as identified by [segcats](https://github.com/laeubli/segcats).


### Basic Usage

All you need is to open `viscats.html` in any reasonably up-to-date web browser, such as a recent release of Mozilla Firefox or Google Chrome. Drag and drop a segmented translation session in CSV format (see below) into the dashed dropdown area or use the Browse button to select a local file to be visualised.

Note that viscats requires no web server architecture. You can simply open `viscats.html` locally from the directory you downloaded it into.


### File Format

viscats is designed to visualise CSV files as created by [segcats](https://github.com/laeubli/segcats), but you can use it to visualise any CSV encoded time series data. Make sure that the CSV has the following three rows:

* `start`: the POSIX timestamp denoting the start of an event/phase (see http://en.wikipedia.org/wiki/Unix_time)
* `end`: the POSIX timestamp denoting the end of an event/phase
* `state`: the name/label of an event/phase

The CSV file can contain any number of other columnts, which viscats will simply ignore.

#### Sample CSV File

```
start,end,state
1402483122015,1402483122515,H1
1402483122515,1402483123015,H3
1402483123015,1402483123515,H2
1402483123515,1402483124015,H2
...
```

Please feel free to use the two sample files that ship with viscats: `sample_short.csv` and `sample_long.csv`.