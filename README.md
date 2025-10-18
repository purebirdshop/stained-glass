# The STAINED GLASS


# Hierarchy
```
stained-glass/
├── src/
│   ├── index.js             # main server
│   ├── routes/
│   │   └── metrics.js       # defines endpoints
│   ├── services/
│   │   ├── ccbService.js    # CCB Church (XML data)
│   │   ├── churchService.js # Church Metrics (JSON data)
│   │   └── cacheService.js  # caching logic
│   ├── utils/
│   │   └── calculations.js  # derived metrics (averages, totals, etc.)
│   └── config.js            # environment, settings
├── package.json
```