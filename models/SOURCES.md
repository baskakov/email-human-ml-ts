# Name dictionaries

Built by `uv run python -m email_ml.dictionaries`. Lowercased, transliterated to `[a-z]`,
minimum length 3, one name per line. Shared with the TypeScript feature extractor.

| file | source | notes |
|---|---|---|
| `first_names.txt` | https://github.com/MatthiasWinkelmann/firstname-database (`firstnames.csv`, derived from the gender.c database, GFDL) | ~55 countries/regions incl. Russia, Ukraine, Arabia/Persia, China, India, Japan, Korea. Compound names (`Anne+Marie`) contribute both parts and the joined form. |
| `last_names.txt` | https://github.com/smashew/NameDatabases (`surnames/all.txt`) | Vowels already ASCII-normalized upstream; includes `ru.txt` (Russian surnames in transliteration). |
