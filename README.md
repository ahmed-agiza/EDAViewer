# EDAV: Cloud EDA Viewer

![EDAV](/client/assets/img/EditorScreenshot.png?raw=true)

EDAV is a cloud-based open-source viewer for electronic design automation (EDA) design files: [Library Exchange Format (LEF) & Design Exchange Format (DEF)](http://www.ispd.cc/contests/19/lefdefref.pdf)

**Website:** [https://edaviewer.com](https://edaviewer.com)

## What is included:

-   [Go](https://golang.org) server for parsing LEF & DEF files into JSON using [OpenDB LEF/DEF 5.8 parsers](https://github.com/The-OpenROAD-Project/OpenDB) to be rendered with the viewer.
-   [Go](https://golang.org) interface for OpenDB to process design files using Go language.
-   Client interface to easily upload design files to the parsing server and render the resulting JSON into the browser (without storage on the server).
-   [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) based LEF/DEF viewer with various features to view and navigate the parsed design.
-   [Serverless SAM](https://aws.amazon.com/serverless/sam) templates to deploy directly to the cloud.

## Using EDAV

### Running on the Cloud

You can access EDAV directly at [https://edaviewer.com](https://edaviewer.com) and start rendering your designs right away.

If you would like to deploy to a private cloud, check the [deploy](/deploy) folder for the serverless configuration and templates.

### Running in Docker

You can build and run EDAV server and client directly using [Docker](https://www.docker.com) by running:

```sh
./run-docker.sh
```

This will build the server and client's docker images and run them on ports **8080 & 3000**, respectively. You can then access EDAV through [http://localhost:3000](http://localhost:3000).

### Running on Bare-metal

#### Building and running the server

The server is built using Go, so you need to have Go installed. Also, the Makefile automatically pulls and builds [OpenDB](https://github.com/The-OpenROAD-Project/OpenDB), but you need to have OpenDB prerequisites ([CMake](https://cmake.org), [Tcl](https://www.tcl.tk), [SWIG](http://www.swig.org), [flex](https://sourceforge.net/projects/flex/), [bison](https://www.gnu.org/software/bison/)..) installed for the build to succeed.
After installing Go and OpenDB prerequisites, run Make to build the server binary (includes OpenDB):

```sh
make build
```

Then run the server:

```sh
make server
```

Ther server should be accessible at port **8080** by default unless modified by the environment variable **PORT**.

#### Building and running the client

The client is built on [Next.js](https://nextjs.org), so you need to have [Node.js](https://nodejs.org) (v10+) and [yarn](https://yarnpkg.com) installed.
To install the node dependencies, you can either:

```sh
cd client && yarn install
```

or

```sh
make build-client
```

Then run the client:

```sh
cd client && yarn run dev
```

or

```sh
make client
```

Ther server should be accessible at port **3000** by default unless modified by the environment variable **PORT**. You might also need to set the environment variable **NEXT_PUBLIC_EDAV_SERVER_URL** to the server URL if you have changed the defaults.

## WebGL Viewer

EDAV renders the parsed design using EDAV LEF/DEF viewer. The viewer is based on [PixiJS](https://www.pixijs.com), which uses a WebGL engine by default (and falls back to canvas if needed) for high-performance rendering in the browser. The viewer has various features, such as:

-   Viewport pan & zoom support.
-   Visibility control panel to hide and show different parts of the design.
-   Components explorer to search and view various design components.
-   Viewer customization from the settings window (changing colors, render settings, etc.).
-   Component details dialog on double click from the viewport or the components explorer.
-   Exporting the design to PNG or JPEG images.

## OpenDB Go Bindings

The server includes a clean interface into OpenDB for parsing design files using [CGO](https://golang.org/cmd/cgo). The interface can be used in any project that desires to process LEF/DEF files using Go instead of regular C++ or Tcl; feel free to ask for support for more features from OpenDB.

Example:

```go
var db goopendb.OpenDB
db, err := goopendb.NewDatabase()
if err != nil {
       fmt.Fprintf(os.Stderr, "%v", err)
       return
}
defer db.FreeDatabase() // Cleanup for C structs
err = db.ParseLEF("server/example/Nangate45/NangateOpenCellLibrary.mod.lef")
if err != nil {
       fmt.Fprintf(os.Stderr, "%v", err)
       return
}
err = db.ParseDEF("server/example/Nangate45/gcd.def")
if err != nil {
       fmt.Fprintf(os.Stderr, "%v", err)
       return
}
design, err := db.GetDesign()
if err != nil {
       fmt.Fprintf(os.Stderr, "%v", err)
       return
}
/**
* The design struct should hold the parsed design objects:
 type Design struct {
    Name           string
    Instances      []*Instance
    Nets           []*Net
    InstancePins   []*Pin
    BlockPins      []*Pin
    RoutingVias    []*Via
    ViaDefinitions []*Via
    Layers         []*Layer
    CoreArea       float64
    DieArea        float64
    DesignArea     float64
    Utilization    float64
    BoundingBox    *Rect
    Core           *Rect
    Die            *Rect
    Rows           []*Row
    Tracks         []*Grid
    Sites          []*Site
    GCell          *Grid
    Geometries     []*Geometry
}
*/
```

## Main libraries and technologies:

-   **[Go](https://golang.org)**: for the server.
-   **[OpenDB](https://github.com/The-OpenROAD-Project/OpenDB)**: for LEF/DEF parsing.
-   **[Node.js](https://nodejs.org)**: for client tecnhologies.
-   **[React](https://reactjs.org)**: for the client interface.
-   **[Next.js](https://nextjs.org)**: for server-side rendering.
-   **[Creative Tim's Next.js Material Kit](https://github.com/creativetimofficial/nextjs-material-kit)**: for the client boilerplate and many components in the client interface.
-   **[Material-UI](https://material-ui.com)**: for many components in the client interface.
-   **[PixiJS](https://www.pixijs.com)**: for the WebGL viewer.

## Contribution

Community contributions are welcome, feel free to open a [pull request](../../pulls) with any new features/fixes you would like to provide.

## Issues

If you encounter any bug or you want to request any new feature, please open a GitHub [issue](../../issues/new/choose) using the templates provided.

## License

EDAV is open-source under the [MIT license](/LICENSE).
