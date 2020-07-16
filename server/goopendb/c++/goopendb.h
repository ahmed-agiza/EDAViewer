// foo.h
#ifdef __cplusplus
extern "C" {
#endif

typedef void *dbDatabase;

/** dbOrientType **/
const int Orientation_R0 = 0;   /** rotate object 0 degrees */
const int Orientation_R90 = 1;  /** rotate object 90 degrees */
const int Orientation_R180 = 2; /** rotate object 180 degrees */
const int Orientation_R270 = 3; /** rotate object 270 degrees */
const int Orientation_MY = 4;   /** mirror about the "Y" axis */
const int Orientation_MYR90 =
    5; /** mirror about the "Y" axis and rotate 90 degrees */
const int Orientation_MX = 6; /** mirror about the "X" axis */
const int Orientation_MXR90 =
    7; /** mirror about the "X" axis and rotate 90 degrees */

/** dbIoType **/
const int IOType_INPUT = 0;
const int IOType_OUTPUT = 1;
const int IOType_INOUT = 2;
const int IOType_FEEDTHRU = 3;

/** dbSigType **/
const int SignalType_SIGNAL = 0;
const int SignalType_POWER = 1;
const int SignalType_GROUND = 2;
const int SignalType_CLOCK = 3;
const int SignalType_ANALOG = 4;
const int SignalType_RESET = 5;
const int SignalType_SCAN = 6;
const int SignalType_TIEOFF = 7;

/** dbWireType **/
const int WireType_NONE = 0;
const int WireType_COVER = 1;
const int WireType_FIXED = 2;
const int WireType_ROUTED = 3;
const int WireType_SHIELD = 4;
const int WireType_NOSHIELD = 5;

/** dbWireShapeType **/
const int WireShapeType_NONE = 0;
const int WireShapeType_RING = 1;
const int WireShapeType_PADRING = 2;
const int WireShapeType_BLOCKRING = 3;
const int WireShapeType_STRIPE = 4;
const int WireShapeType_FOLLOWPIN = 5;
const int WireShapeType_IOWIRE = 6;
const int WireShapeType_COREWIRE = 7;
const int WireShapeType_BLOCKWIRE = 8;
const int WireShapeType_BLOCKAGEWIRE = 9;
const int WireShapeType_FILLWIRE = 10;
const int WireShapeType_DRCFILL = 11;

/** dbMasterType **/
const int MasterType_BLOCK = 0;
const int MasterType_CORE = 1;
const int MasterType_PAD = 2;
const int MasterType_ENDCAP = 3;

/** dbTechLayerType **/
const int LayerType_ROUTING = 0;
const int LayerType_CUT = 1;
const int LayerType_MASTERSLICE = 2;
const int LayerType_OVERLAP = 3;
const int LayerType_IMPLANT = 4;
const int LayerType_NONE = 5;

/** dbLayerDirection **/
const int Direction_NONE = 0;
const int Direction_HORIZONTAL = 1;
const int Direction_VERTICAL = 2;

/** Decoded wire segment types **/
const int EdgeType_SEGMENT = 0;
const int EdgeType_TECH_VIA = 1;
const int EdgeType_VIA = 2;
const int EdgeType_SHORT = 3;
const int EdgeType_VWIRE = 4;

const char *LastError;

struct NetRef;
struct ViaRef;
struct PinRef;
struct LayerRef;
struct InstanceRef;
struct SiteRef;
struct RowRef;
struct GridRef;
struct GCellRef;

/** odb::dbPoint **/
typedef struct {
  int x;
  int y;
} Point;

/** odb::Rect or odb::dbBox **/
typedef struct {
  int id;
  int xMin;
  int yMin;
  int xMax;
  int yMax;
  int shapeType; // Generic shape type flag
  struct LayerRef *layer;
  struct ViaRef *via;
  void *dbObject; // for dbBox only
} Rect;

// Collection of geometry shapes for pin, via..etc
typedef struct {
  int id;
  Rect **boxes;
  int boxSz;
} Geometry;

/** Routing wire segment **/

typedef struct {
  int edgeType;
  Rect *rect;
  struct ViaRef *via;
  struct LayerRef *layer;
} Edge;

/** odb::dbNet  **/
typedef struct NetRef {
  int id;
  char *name;
  int isSpecial;
  int isRouted;
  struct PinRef **pins;
  int pinSz;
  int wireType;
  void *dbObject;
  Edge *edges;
  int edgeSz;
  Geometry **specialBoxes;
  int specialBoxSz;
} Net;

/** odb::dbTechLayer **/
typedef struct LayerRef {
  int id;
  int width;
  int spacing;
  double area;
  int layerType;
  int direction;
  struct LayerRef *upperLayer;
  struct LayerRef *lowerLayer;
  char *name;
  char *alias;
  void *dbObject;
} Layer;

/** odb::dbVia **/
typedef struct ViaRef {
  int id;
  char *name;
  Rect *rect;
  Layer *topLayer;
  Layer *bottomLayer;
  Layer *cutLayer;
  int isBlock;
  int isTech;
  void *dbObject;
} Via;

/** odb::dbITerm && odb::dbBTerm **/
typedef struct PinRef {
  int id;
  char *name;
  struct InstanceRef *instance;
  int signalType;
  Net *net;
  int direction;
  Point location; // Average location
  Geometry **geometries;
  int geometrySz;
  void *dbObject;
  int isBlock;
  int isSpecial;
} Pin;

/** odb::dbInst **/
typedef struct InstanceRef {
  int id;
  char *name;
  Point location;
  Point origin;
  int orientation;
  char *master;
  int masterType;
  int isFiller;
  int isSequential;
  struct SiteRef *site;
  Pin **pins;
  int pinSz;
  int isPlaced;
  Rect *boundingBox;
  Rect *halo;
  Geometry *obstructions;
  void *dbObject;
} Instance;

/** odb::dbSite **/
typedef struct SiteRef {
  int id;
  char *name;
  void *dbObject;
} Site;

/** odb::dbRow **/
typedef struct RowRef {
  int id;
  char *name;
  void *dbObject;
  struct SiteRef *site;
  int direction;
  int orientation;
  int originX;
  int originY;
  int spacing;
  Rect *boundingBox;
} Row;

/** odb::dbTrack or  odb::dbGCellGrid **/
typedef struct GridRef {
  int id;
  Layer *layer;
  int *gridX;
  int gridXSz;
  int *gridY;
  int gridYSz;
  int *gridXPatternOrigins;
  int *gridXPatternLineCounts;
  int *gridXPatternSteps;
  int gridXPatternSz;
  int *gridYPatternOrigins;
  int *gridYPatternLineCounts;
  int *gridYPatternSteps;
  int gridYPatternSz;
  void *dbObject;
} Grid;

typedef struct {
  char *name;
  Instance **instances;
  int instanceSz;
  Net **nets;
  int netSz;
  Pin **instancePins;
  int instancePinSz;
  Pin **blockPins;
  int blockPinSz;
  Via **routingVias;
  int routingViaSz;
  Via **viaDefinitions;
  int viaDefinitionSz;
  Layer **layers;
  int layerSz;
  Site **sites;
  int siteSz;
  Grid **tracks;
  int trackSz;
  Row **rows;
  Grid *gcells;
  Geometry **geometries;
  int geometrySz;
  int rowSz;
  Rect *core;
  double coreArea;
  Rect *die;
  double dieArea;
  double designArea;
  double utilization;
  Rect *boundingBox;

  Rect **rects; // For memory cleanup
  int rectSz;
} Design;

dbDatabase DatabaseNew(void);
int DatabaseFree(dbDatabase);

// Database unit to meters
double DbuToMeters(dbDatabase dbPtr, int dist);

int ReadDesign(dbDatabase, const char *filepath);
int ReadLib(dbDatabase, const char *filepath, const char *libname);
int ReadTech(dbDatabase, const char *filepath);
int ReadTechAndLib(dbDatabase, const char *filepath, const char *libname);
int HasTech(dbDatabase);

Design *GetDesign(dbDatabase);
void FreeInstance(Instance *);
void FreePin(Pin *);
void FreeNet(Net *);
void FreeVia(Via *);
void FreeLayer(Layer *);
void FreeSite(Site *);
void FreeRow(Row *);
void FreeGrid(Grid *);
void FreeRect(Rect *);
void FreeGeometry(Geometry *);
void FreeDesign(Design *);

// dbOrientType to int
int castOrientation(void *);
// dbIoType to int
int castIoType(void *);
// dbSigType to int
int castSignalType(void *);
// dbMasterType to int
int castMasterType(void *);
// dbWireType to int
int castWireType(void *);
// dbWireShapeType to int
int castWireShapeType(void *);
// dbPoint to Point
Point castPoint(void *);
// dbBox to Rect
Rect *castBox(void *, int);
// dbRect to Rect
Rect *castRect(void *, int);
// dbdbTechLayerType to int
int castLayerType(void *ptr);
// dbTechLayerDir to int
int castLayerDirection(void *ptr);
// dbRowDir to int
int castRowDirection(void *ptr);
// dbRtEdge type to int
int castEdgeType(int typ);

#ifdef __cplusplus
}
#endif