# KSG Awards Web App

React front end for the staff rewards and recognition system.

## Development

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:8001/api
npm install
npm run dev
```

## Build

`VITE_API_URL` is compiled into the bundle, so it must be set at build time.

```bash
docker build --build-arg VITE_API_URL=https://your-api.onrender.com/api -t ksg-awards-frontend .
docker run -p 8080:10000 ksg-awards-frontend
```

## Layout

| Path | Contents |
|---|---|
| `src/pages/guest`, `src/pages/auth` | Landing page, sign in, registration |
| `src/pages/staff` | Home, nominate, vote, results |
| `src/pages/management` | Overview, cycles, nominations, results, staff accounts |
| `src/components` | Shared interface pieces: shell, buttons, inputs, dialogs, results board |
| `src/hooks` | Data loading for the active cycle, nominations, votes and staff |
| `src/lib` | Formatting helpers, phase labels and the results spreadsheet export |

The Excel export library is loaded only when someone downloads a spreadsheet, which keeps the main bundle small.
