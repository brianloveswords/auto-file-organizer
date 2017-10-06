# auto-file-organizer

Just another tool for automatically organizing files and folders.

## License

[GPL 3.0](https://opensource.org/licenses/GPL-3.0)

``` text
    auto-file-organizer
    Copyright (C) 2017  Brian J Brennan

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
```

## Building

Use `npm run build`.

## Testing

Use `npm run test`

## Configuration

Configuration Root

| key | type | description
|-----|------|------------
| `rules` | Rule[] | Array of rules to be run, in order.
| `logfile` | string? | Full path to logfile. If blank, logging will be disabled. **Disabling logging is not recommended.**
| `notifyOnError` | boolean | Use the system notifier when a runtime error occurs. Defaults to `false`.

**Rule**

| key | type | description
|-----|------|------------
| `name` | string | Name of the rule. Must be unique.
| `action` | "move" \| "destroy | Action to take on the file. `move` will move a file, `destroy` will permanently delete the file.
| `watch` | boolean | Watch the directory for changes. Defaults to `false`. **If true, `frequency` is ignored**.
| `frequency` | "minute" \| "hour" \| "day" \| "week" \| "month" \| "year" | How frequently the rule should run, e.g. "minute" will run the rule every minute, "hour" will run the rule every hour.
| `root` | string | Absolute path to root where pattern matching will start. Example: "~/Downloads". **Directory will be validated at type of configuration load, but will throw runtime error if it later goes missing**
| `recurse` | boolean | Descend into subdirectories. Defaults to `false`.
| `patternType` | "glob" \| "regexp" | Parse the pattern as either a glob or a regexp.
| `pattern` | string | Pattern to match files against. Interpreted as either a glob or regexp depending on `patternType`.
| `conditions` | Condition[] | Array of conditions for this rule. See [Conditions](#conditions) below.
| `matchDirectories` | boolean | Match directories with the `pattern` or just files. Defaults to `false`.
| `removeEmptyDirectories`| boolean | Remove empty directories below the root after the action has been completed. Defaults to `false`.
| `overwrite` | boolean | *("move" only)* Overwrite files in the output directory if they already exist. Defaults to `false` **Will cause runtime error if set to false and file exists**.
| `output` | string |  *("move" only)* Pattern for outputting files. See [Output Pattern](#output-pattern) below..
| `mkdirp` | boolean |  *("move" only)* Whether to make intermediate directories when evaluating the output pattern. Defaults to `true`. **Will cause runtime error if set to false and intermediate directories don't exist**.

### Conditions

- `accessed`: DateCondition
- `modified`: DateCondition
- `created`: DateCondition
- `size`: SizeCondition

**DateCondition**

| key | type | description
|-----|------|------------
| `comparison` | "gt" \| "gte" \| "eq" \| "lte" \| "lt" | Comparison operator to use.
| `unit` | "days" \| "months"  \| "years | Unit of type the value should be interpreted as.
| `value` | number | Value to compare against.


**SizeCondition**

| key | type | description
|-----|------|------------
| `comparison` | "gt" \| "gte" \| "eq" \| "lte" \| "lt" | Comparison operator to use.
| `unit` | "b" \| "kb"  \| "mb" \| "gb" | Unit of type the value should be interpreted as.
| `value` | number | Value to compare against.


## Example Configuration

``` json
{"logfile": "~/organizer.log",
 "notifyOnError": true,
 "rules": [
  { "name": "organize-gifs",
    "action": "move",
    "frequency": "hour",
    "root": "~/Downloads",
    "recurse": false,
    "patternType": "regexp",
    "pattern": "(.*?)\.gif",
    "output": "~/gifs/${date('modified', 'MMMM-YYYY')}/${filename}",
    "mkdirp": true,
    "conditions": [
       {"created": {"comparison": "gt", "unit": "minutes", "value": 30 }},
    ]
  },
  { "name": "organize-screenshots",
    "action": "move",
    "root": "~/Desktop",
    "recurse": false,
    "patternType": "glob",
    "pattern": "Screen Shot*",
    "output": "~/screenshots/${date('modified', 'MMMM-YYYY')}/${filename}",
    "mkdirp": true,
  },
  { "name": "trash-old-screenshots",
    "action": "move",
    "root": "~/screenshots",
    "recurse": true,
    "patternType": "glob",
    "pattern": "*",
    "mkdirp": true,
    "output": "~/.Trash/${filename}",
    "conditions": [
       {"accessed": {"comparison": "gt", "unit": "days", "value": 30 }},
     ]
  },
  { "name": "take-out-trash",
    "action": "destroy",
    "root": "~/.Trash",
    "recurse": true,
    "matchDirectories": true,
    "patternType": "glob",
    "pattern": "*",
    "conditions": [
       {"accessed": {"comparison": "gt", "unit": "days", "value": 30 }},
    ]
  },
]}
```

## Notes

- Don't follow symlinks to directories to prevent infinite recursion.
