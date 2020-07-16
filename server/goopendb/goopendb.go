package goopendb

// Wrapper for OpenDB Si2 LEF/DEF parser

// #cgo LDFLAGS: -L${SRCDIR}/c++
// #cgo LDFLAGS: -ldl -lgoopendb -llefin -llef -ldefin -ldef -lzlib -llefzlib -lopendb -lzutil -ldefout -llefout -ltm -lm -ltcl -lstdc++
// #include "stdlib.h"
// #include "c++/goopendb.h"
import "C"
import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"reflect"
	"regexp"
	"strings"
	"unsafe"
)

// Orientation is instance placement orientation
type Orientation int

// Instance orientation enums
const (
	OrientationR0    Orientation = iota /** rotate object 0 degrees */
	OrientationR90                      /** rotate object 90 degrees */
	OrientationR180                     /** rotate object 180 degrees */
	OrientationR270                     /** rotate object 270 degrees */
	OrientationMY                       /** mirror about the "Y" axis */
	OrientationMYR90                    /** mirror about the "Y" axis and rotate 90 degrees */
	OrientationMX                       /** mirror about the "X" axis */
	OrientationMXR90                    /** mirror about the "X" axis and rotate 90 degrees */
)

func (o Orientation) String() string {
	switch o {
	case OrientationR0:
		return "R0"
	case OrientationR90:
		return "90"
	case OrientationR180:
		return "R180"
	case OrientationR270:
		return "R270"
	case OrientationMY:
		return "MY"
	case OrientationMYR90:
		return "MYR90"
	case OrientationMX:
		return "MX"
	case OrientationMXR90:
		return "MXR90"
	}
	return "Unknown"
}

// IoType is pin IO type
type IoType int

// Pin IO type enums
const (
	IOTypeINPUT IoType = iota
	IOTypeOUTPUT
	IOTypeINOUT
	IOTypeFEEDTHRU
)

func (typ IoType) String() string {
	switch typ {
	case IOTypeINPUT:
		return "INPUT"
	case IOTypeOUTPUT:
		return "OUTPUT"
	case IOTypeINOUT:
		return "INOUT"
	case IOTypeFEEDTHRU:
		return "FEEDTHRU"
	}
	return "Unknown"
}

// LayerType is tech layer type
type LayerType int

// Layer type enums
const (
	LayerTypeROUTING LayerType = iota
	LayerTypeCUT
	LayerTypeMASTERSLICE
	LayerTypeOVERLAP
	LayerTypeIMPLANT
	LayerTypeNONE
)

func (typ LayerType) String() string {
	switch typ {
	case LayerTypeROUTING:
		return "ROUTING"
	case LayerTypeCUT:
		return "CUT"
	case LayerTypeMASTERSLICE:
		return "MASTERSLICE"
	case LayerTypeOVERLAP:
		return "OVERLAP"
	case LayerTypeIMPLANT:
		return "IMPLANT"
	case LayerTypeNONE:
		return "NONE"
	}
	return "NONE"
}

// Direction is tech layer direction
type Direction int

// Layer Direction enums
const (
	DirectionNONE Direction = iota
	DirectionHORIZONTAL
	DirectionVERTICAL
)

func (dir Direction) String() string {
	switch dir {
	case DirectionNONE:
		return "NONE"
	case DirectionHORIZONTAL:
		return "HORIZONTAL"
	case DirectionVERTICAL:
		return "VERTICAL"
	}
	return "NONE"
}

// EdgeType is connection segment type
type EdgeType int

// EdgeType enums
const (
	EdgeTypeSEGMENT = iota
	EdgeTypeTECHVIA
	EdgeTypeVIA
	EdgeTypeSHORT
	EdgeTypeVWIRE
)

func (typ EdgeType) String() string {
	switch typ {
	case EdgeTypeSEGMENT:
		return "SEGMENT"
	case EdgeTypeTECHVIA:
		return "TECHVIA"
	case EdgeTypeVIA:
		return "VIA"
	case EdgeTypeSHORT:
		return "SHORT"
	case EdgeTypeVWIRE:
		return "VWIRE"
	}
	return "Unknown"
}

// MasterType is connection segment type
type MasterType int

// MasterType enums
const (
	MasterTypeBLOCK = iota
	MasterTypeCORE
	MasterTypePAD
	MasterTypeENDCAP
)

func (typ MasterType) String() string {
	switch typ {
	case MasterTypeBLOCK:
		return "BLOCK"
	case MasterTypeCORE:
		return "CORE"
	case MasterTypePAD:
		return "PAD"
	case MasterTypeENDCAP:
		return "ENDCAP"
	}
	return "Unknown"
}

// SignalType is connection segment type
type SignalType int

// SignalType enums
const (
	SignalTypeSIGNAL = iota
	SignalTypePOWER
	SignalTypeGROUND
	SignalTypeCLOCK
	SignalTypeANALOG
	SignalTypeRESET
	SignalTypeSCAN
	SignalTypeTIEOFF
)

func (typ SignalType) String() string {
	switch typ {
	case SignalTypeSIGNAL:
		return "SIGNAL"
	case SignalTypePOWER:
		return "POWER"
	case SignalTypeGROUND:
		return "GROUND"
	case SignalTypeCLOCK:
		return "CLOCK"
	case SignalTypeANALOG:
		return "ANALOG"
	case SignalTypeRESET:
		return "RESET"
	case SignalTypeSCAN:
		return "SCA"
	case SignalTypeTIEOFF:
		return "TIEOFF"
	}
	return "Unknown"
}

// WireType is connection segment type
type WireType int

// WireType enums
const (
	WireTypeNONE = iota
	WireTypeCOVER
	WireTypeFIXED
	WireTypeROUTED
	WireTypeSHIELD
	WireTypeNOSHIELD
)

func (typ WireType) String() string {
	switch typ {
	case WireTypeNONE:
		return "NONE"
	case WireTypeCOVER:
		return "COVER"
	case WireTypeFIXED:
		return "FIXED"
	case WireTypeROUTED:
		return "ROUTED"
	case WireTypeSHIELD:
		return "SHIELD"
	case WireTypeNOSHIELD:
		return "NOSHIELD"
	}
	return "Unknown"
}

// WireShapeType is connection segment type
type WireShapeType int

// WireShapeType enums
const (
	WireShapeTypeNONE = iota
	WireShapeTypeRING
	WireShapeTypePADRING
	WireShapeTypeBLOCKRING
	WireShapeTypeSTRIPE
	WireShapeTypeFOLLOWPIN
	WireShapeTypeIOWIRE
	WireShapeTypeCOREWIRE
	WireShapeTypeBLOCKWIRE
	WireShapeTypeBLOCKAGEWIRE
	WireShapeTypeFILLWIRE
	WireShapeTypeDRCFILL
)

func (typ WireShapeType) String() string {
	switch typ {
	case WireShapeTypeNONE:
		return "NONE"
	case WireShapeTypeRING:
		return "RING"
	case WireShapeTypePADRING:
		return "PADRING"
	case WireShapeTypeBLOCKRING:
		return "BLOCKRING"
	case WireShapeTypeSTRIPE:
		return "STRIPE"
	case WireShapeTypeFOLLOWPIN:
		return "FOLLOWPIN"
	case WireShapeTypeIOWIRE:
		return "IOWIRE"
	case WireShapeTypeCOREWIRE:
		return "COREWIRE"
	case WireShapeTypeBLOCKWIRE:
		return "BLOCKWIRE"
	case WireShapeTypeBLOCKAGEWIRE:
		return "BLOCKAGEWIRE"
	case WireShapeTypeFILLWIRE:
		return "FILLWIRE"
	case WireShapeTypeDRCFILL:
		return "DRCFILL"

	}
	return "Unknown"
}

// OpenDB is a wrapper for OpenDB database object
type OpenDB struct {
	db C.dbDatabase
}

// Point is an X, Y coordinate
type Point struct {
	X int
	Y int
}

// Copy Point pointer to a new Point
func (p *Point) Copy() Point {
	return Point{
		X: p.X,
		Y: p.Y,
	}
}

// Rect is a rectangle shape holder
type Rect struct {
	ID         int
	XMin       int
	YMin       int
	XMax       int
	YMax       int
	ShapeType  int
	Layer      *Layer
	Via        *Via
	InComplete bool
}

// Copy Rect pointer to a new Rect
func (r *Rect) Copy() Rect {
	return Rect{
		ID:         r.ID,
		XMin:       r.XMin,
		YMin:       r.YMin,
		XMax:       r.XMax,
		YMax:       r.YMax,
		Layer:      r.Layer,
		Via:        r.Via,
		ShapeType:  r.ShapeType,
		InComplete: r.InComplete,
	}
}

// Geometry is a collecitons of shapes (rect)
type Geometry struct {
	ID         int
	Boxes      []*Rect
	InComplete bool
}

// Copy Geometry pointer to a new Geometry
func (r *Geometry) Copy() Geometry {
	geom := Geometry{
		ID:         r.ID,
		Boxes:      make([]*Rect, len(r.Boxes)),
		InComplete: r.InComplete,
	}
	for i, box := range r.Boxes {
		boxCp := box.Copy()
		if boxCp.Layer != nil {
			boxCp.Layer = &Layer{
				ID:         boxCp.Layer.ID,
				InComplete: true,
			}
		}
		if boxCp.Via != nil {
			boxCp.Via = &Via{
				ID:         boxCp.Via.ID,
				InComplete: true,
			}
		}
		geom.Boxes[i] = &boxCp
	}
	return geom
}

// Copy Grid pointer to a new Grid
func (r *Grid) Copy() Grid {
	var layer *Layer = r.Layer
	gridXCopy := r.GridX
	gridYCopy := r.GridY
	gridXPatternOriginsCopy := r.GridXPatternOrigins
	gridXPatternLineCountsCopy := r.GridXPatternLineCounts
	gridXPatternStepsCopy := r.GridXPatternSteps
	gridYPatternOriginsCopy := r.GridYPatternOrigins
	gridYPatternLineCountsCopy := r.GridYPatternLineCounts
	gridYPatternStepsCopy := r.GridYPatternSteps

	return Grid{
		ID:                     r.ID,
		Layer:                  layer,
		GridX:                  gridXCopy,
		GridY:                  gridYCopy,
		GridXPatternOrigins:    gridXPatternOriginsCopy,
		GridXPatternLineCounts: gridXPatternLineCountsCopy,
		GridXPatternSteps:      gridXPatternStepsCopy,
		GridYPatternOrigins:    gridYPatternOriginsCopy,
		GridYPatternLineCounts: gridYPatternLineCountsCopy,
		GridYPatternSteps:      gridYPatternStepsCopy,
		InComplete:             r.InComplete,
	}
}

// Edge is a net routing edge
type Edge struct {
	Type  EdgeType
	Rect  *Rect
	Via   *Via
	Layer *Layer
}

// Instance is a wrapper for a single instance
type Instance struct {
	ID           int
	Name         string `json:",omitempty"`
	Location     *Point `json:",omitempty"`
	Origin       *Point `json:",omitempty"`
	Orientation  Orientation
	Master       string `json:",omitempty"`
	Pins         []*Pin `json:",omitempty"`
	IsPlaced     bool
	BoundingBox  *Rect `json:",omitempty"`
	Halo         *Rect `json:",omitempty"`
	IsFiller     bool
	MasterType   MasterType
	Obstructions *Geometry `json:",omitempty"`
	InComplete   bool      // The struct contains ID only
}

// Pin is a wrapper for a single pin
type Pin struct {
	ID         int
	Name       string    `json:",omitempty"`
	Instance   *Instance `json:",omitempty"`
	Net        *Net      `json:",omitempty"`
	Direction  Direction
	Location   *Point      `json:",omitempty"`
	Geometries []*Geometry `json:",omitempty"`
	SignalType SignalType
	IsBlock    bool
	IsSpecial  bool
	InComplete bool // The struct contains ID only
}

// Net is a wrapper for a single net
type Net struct {
	ID           int
	Name         string `json:",omitempty"`
	IsSpecial    bool
	IsRouted     bool
	Pins         []*Pin  `json:",omitempty"`
	Edges        []*Edge `json:",omitempty"`
	SpecialBoxes []*Geometry
	InComplete   bool // The struct contains ID only
}

// Layer is a wrapper for a LEF layer
type Layer struct {
	ID         int
	Name       string `json:",omitempty"`
	Alias      string `json:",omitempty"`
	Width      int
	Spacing    int
	Area       float64
	Type       LayerType
	Direction  Direction
	UpperLayer *Layer `json:",omitempty"`
	LowerLayer *Layer `json:",omitempty"`
	InComplete bool   // The struct contains ID only
}

// Via is a wrapper for design via
type Via struct {
	ID          int
	Name        string `json:",omitempty"`
	Rect        *Rect  `json:",omitempty"`
	TopLayer    *Layer `json:",omitempty"`
	CutLayer    *Layer `json:",omitempty"`
	BottomLayer *Layer `json:",omitempty"`
	IsBlock     bool
	IsTech      bool
	InComplete  bool // The struct contains ID only
}

// Site is a wrapper for a technology sit
type Site struct {
	ID         int
	Name       string `json:",omitempty"`
	InComplete bool   // The struct contains ID only
}

// Grid is wrapper for track or gcell grids
type Grid struct {
	ID                     int
	Layer                  *Layer `json:",omitempty"`
	GridX                  []int
	GridY                  []int
	GridXPatternOrigins    []int
	GridXPatternLineCounts []int
	GridXPatternSteps      []int
	GridYPatternOrigins    []int
	GridYPatternLineCounts []int
	GridYPatternSteps      []int
	InComplete             bool // The struct contains ID only
}

// Row is wrapper for placement row
type Row struct {
	ID          int
	Name        string `json:",omitempty"`
	Site        *Site  `json:",omitempty"`
	Direction   Direction
	Orientation Orientation
	OriginX     int
	OriginY     int
	Spacing     int
	BoundingBox *Rect
	InComplete  bool // The struct contains ID only
}

// Design is a wrapper for parsed DEF/LEF
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

// DesignFile represents a wrapper for a submitted design file
type DesignFile struct {
	ID        int
	Type      string
	FileName  string
	FilePath  string
	IsTech    bool // For LEF files
	IsLibrary bool // For LEF files
}

// DesignFiles represents a wrapper for design files
type DesignFiles struct {
	DEF *DesignFile
	LEF []*DesignFile
}

// Validate that the DEF file won't crash OpenDB parser
func validateDEF(filepath string) (err error) {
	data, err := ioutil.ReadFile(filepath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "File reading error")
		return
	}
	designHeaderRe, _ := regexp.Compile(`(?ms)^\s*DESIGN\s+([\w\\//\.$]+?)\s*;.+^\s*END DESIGN\s*$`)
	content := strings.TrimSpace(string(data))
	if !designHeaderRe.MatchString(content) {
		err = fmt.Errorf("DEF error, missing or wrong design header")
		return
	}
	return
}

// NewDatabase creates a new OpenDB database
func NewDatabase() (ret OpenDB, err error) {
	db := C.DatabaseNew()
	if db == nil {
		cErr := C.GoString(C.LastError)
		if len(cErr) > 0 {
			err = fmt.Errorf("%v", C.GoString(C.LastError))
		} else {
			err = fmt.Errorf("Unknown error has occured")
		}
	}
	ret.db = db
	return ret, err
}

// FreeDatabase releases OpenDB database
func (ref OpenDB) FreeDatabase() (err error) {
	rc := C.DatabaseFree(ref.db)
	if rc != 0 {
		cErr := C.GoString(C.LastError)
		if len(cErr) > 0 {
			err = fmt.Errorf("%v", C.GoString(C.LastError))
		} else {
			err = fmt.Errorf("Unknown error has occured")
		}
	}
	return
}

// ParseLEFLibrary reads the library section of a LEF technology file
func (ref OpenDB) ParseLEFLibrary(filepath string) (err error) {
	rc := C.ReadLib(ref.db, C.CString(filepath), C.CString(generateLibraryName(filepath)))
	if rc != 0 {
		cErr := C.GoString(C.LastError)
		if len(cErr) > 0 {
			err = fmt.Errorf("%v", C.GoString(C.LastError))
		} else {
			err = fmt.Errorf("Unknown error has occured")
		}
	}
	return
}

// ParseLEFTechnology reads the technology section of a LEF technology file
func (ref OpenDB) ParseLEFTechnology(filepath string) (err error) {
	rc := C.ReadTech(ref.db, C.CString(filepath))
	if rc != 0 {
		cErr := C.GoString(C.LastError)
		if len(cErr) > 0 {
			err = fmt.Errorf("%v", C.GoString(C.LastError))
		} else {
			err = fmt.Errorf("Unknown error has occured")
		}
	}
	return

}

// ParseLEF reads the library and technology section of a LEF technology file
func (ref OpenDB) ParseLEF(filepath string) (err error) {
	rc := C.ReadTechAndLib(ref.db, C.CString(filepath), C.CString(generateLibraryName(filepath)))
	if rc != 0 {
		cErr := C.GoString(C.LastError)
		if len(cErr) > 0 {
			err = fmt.Errorf("%v", C.GoString(C.LastError))
		} else {
			err = fmt.Errorf("Unknown error has occured")
		}
	}
	return

}

// ParseDEF reads a design DEF file
func (ref OpenDB) ParseDEF(filepath string) (err error) {
	err = validateDEF(filepath)
	if err != nil {
		return
	}
	rc := C.ReadDesign(ref.db, C.CString(filepath))
	if rc != 0 {
		cErr := C.GoString(C.LastError)
		if len(cErr) > 0 {
			err = fmt.Errorf("%v", C.GoString(C.LastError))
		} else {
			err = fmt.Errorf("Unknown error has occured")
		}
	}
	return

}

// GetDesign converts the parsed design to native go structs
func (ref OpenDB) GetDesign() (design *Design, err error) {
	design = &Design{}

	// Get design instances
	var sz int = 0
	arrSzPtr := unsafe.Pointer(&sz)
	designPtr, err := C.GetDesign(ref.db)
	if err != nil {
		return
	}
	defer C.FreeDesign(designPtr)
	sz = *(*int)(arrSzPtr)
	design.Name = C.GoString(designPtr.name)

	design.Instances = dbInstanceArrayToSlice(designPtr.instances, int(designPtr.instanceSz), false)
	design.Nets = dbNetArrayToSlice(designPtr.nets, int(designPtr.netSz), false)
	design.InstancePins = dbPinArrayToSlice(designPtr.instancePins, int(designPtr.instancePinSz), false)
	design.BlockPins = dbPinArrayToSlice(designPtr.blockPins, int(designPtr.blockPinSz), false)
	design.RoutingVias = dbViaArrayToSlice(designPtr.routingVias, int(designPtr.routingViaSz), false)
	design.ViaDefinitions = dbViaArrayToSlice(designPtr.viaDefinitions, int(designPtr.viaDefinitionSz), false)
	design.Layers = dbLayerArrayToSlice(designPtr.layers, int(designPtr.layerSz), false)
	design.CoreArea = float64(designPtr.coreArea)
	design.DieArea = float64(designPtr.dieArea)
	design.DesignArea = float64(designPtr.designArea)
	design.Utilization = float64(designPtr.utilization)
	design.Core = designPtr.core.Rect(false)
	design.BoundingBox = designPtr.boundingBox.Rect(false)
	design.Die = designPtr.die.Rect(false)
	design.Rows = dbRowArrayToSlice(designPtr.rows, int(designPtr.rowSz), false)
	design.Tracks = dbTrackArrayToSlice(designPtr.tracks, int(designPtr.trackSz), false)
	design.Sites = dbSiteArrayToSlice(designPtr.sites, int(designPtr.siteSz), false)
	design.Geometries = dbGeometryArrayToSlice(designPtr.geometries, int(designPtr.geometrySz), false)
	design.GCell = nil
	if designPtr.gcells != nil {
		design.GCell = designPtr.gcells.Grid(false)
	}
	design.buildReferences()

	return
}

// Populate design objects cross-references
func (design *Design) buildReferences() {
	instanceMap := make(map[int]*Instance)
	netMap := make(map[int]*Net)
	pinMap := make(map[int]*Pin)
	viaMap := make(map[int]*Via)
	layerMap := make(map[int]*Layer)
	for _, inst := range design.Instances {
		instanceMap[inst.ID] = inst
	}
	for _, net := range design.Nets {
		netMap[net.ID] = net
	}
	for _, pin := range design.InstancePins {
		pinMap[pin.ID] = pin
	}
	for _, pin := range design.BlockPins {
		pinMap[pin.ID] = pin
	}
	for _, via := range design.RoutingVias {
		viaMap[via.ID] = via
	}
	for _, via := range design.ViaDefinitions {
		viaMap[via.ID] = via
	}
	for _, layer := range design.Layers {
		layerMap[layer.ID] = layer
	}

	for _, inst := range instanceMap {
		var pins []*Pin
		for _, pin := range inst.Pins {
			pins = append(pins, pinMap[pin.ID])
		}
		inst.Pins = pins
	}

	for _, pin := range pinMap {
		if pin.Instance != nil {
			pin.Instance = instanceMap[pin.Instance.ID]
		}
		if pin.Net != nil {
			pin.Net = netMap[pin.Net.ID]
		}
	}
	for _, net := range netMap {
		var pins []*Pin
		for _, pin := range net.Pins {
			pins = append(pins, pinMap[pin.ID])
		}
		net.Pins = pins
		for _, edge := range net.Edges {
			if edge.Via != nil {
				edge.Via = viaMap[edge.Via.ID]
			}
			if edge.Layer != nil {
				edge.Layer = layerMap[edge.Layer.ID]
			}
		}
	}
	for _, layer := range layerMap {
		if layer.UpperLayer != nil {
			layer.UpperLayer = layerMap[layer.UpperLayer.ID]
		}
		if layer.LowerLayer != nil {
			layer.LowerLayer = layerMap[layer.LowerLayer.ID]
		}
	}
	for _, via := range viaMap {
		if via.TopLayer != nil {
			via.TopLayer = layerMap[via.TopLayer.ID]
		}
		if via.BottomLayer != nil {
			via.BottomLayer = layerMap[via.BottomLayer.ID]
		}
		if via.CutLayer != nil {
			via.CutLayer = layerMap[via.CutLayer.ID]
		}
	}
}

// CompactDesign returns a smaller representation without circular dependencies for JSON encoding
func (design *Design) CompactDesign() (compactDesign *Design) {
	instanceMap := make(map[int]*Instance)
	netMap := make(map[int]*Net)
	pinMap := make(map[int]*Pin)
	viaMap := make(map[int]*Via)
	layerMap := make(map[int]*Layer)
	rowMap := make(map[int]*Row)
	trackMap := make(map[int]*Grid)
	siteMap := make(map[int]*Site)
	geometryMap := make(map[int]*Geometry)

	var instances []*Instance
	var nets []*Net
	var instancePins []*Pin
	var blockPins []*Pin
	var routingVias []*Via
	var viaDefinitions []*Via
	var layers []*Layer
	var rows []*Row
	var tracks []*Grid
	var sites []*Site
	var geometries []*Geometry

	compactDesign = &Design{
		Name:  design.Name,
		GCell: nil,
	}

	for _, inst := range design.Instances {
		instanceMap[inst.ID] = &(*inst)
		if instanceMap[inst.ID].Location != nil {
			cp := instanceMap[inst.ID].Location.Copy()
			instanceMap[inst.ID].Location = &cp
		}
		if instanceMap[inst.ID].Origin != nil {
			cp := instanceMap[inst.ID].Origin.Copy()
			instanceMap[inst.ID].Origin = &cp
		}
		if instanceMap[inst.ID].BoundingBox != nil {
			cp := instanceMap[inst.ID].BoundingBox.Copy()
			instanceMap[inst.ID].BoundingBox = &cp
		}
		if instanceMap[inst.ID].Halo != nil {
			cp := instanceMap[inst.ID].Halo.Copy()
			instanceMap[inst.ID].Halo = &cp
		}
		instances = append(instances, instanceMap[inst.ID])
	}
	for _, net := range design.Nets {
		netMap[net.ID] = &(*net)
		var geomCopy []*Geometry
		for _, geom := range netMap[net.ID].SpecialBoxes {
			geomCopy = append(geomCopy, &Geometry{
				ID:         geom.ID,
				InComplete: true,
			})
		}
		netMap[net.ID].SpecialBoxes = geomCopy
		nets = append(nets, netMap[net.ID])
	}
	for _, pin := range design.InstancePins {
		pinMap[pin.ID] = &(*pin)
		if pinMap[pin.ID].Location != nil {
			cp := pinMap[pin.ID].Location.Copy()
			pinMap[pin.ID].Location = &cp
		}
		var geomCopy []*Geometry
		for _, geom := range pinMap[pin.ID].Geometries {
			geomCopy = append(geomCopy, &Geometry{
				ID:         geom.ID,
				InComplete: true,
			})
		}
		pinMap[pin.ID].Geometries = geomCopy
		instancePins = append(instancePins, pinMap[pin.ID])
	}
	for _, pin := range design.BlockPins {
		pinMap[pin.ID] = &(*pin)
		if pinMap[pin.ID].Location != nil {
			cp := pinMap[pin.ID].Location.Copy()
			pinMap[pin.ID].Location = &cp
		}
		var geomCopy []*Geometry
		for _, geom := range pinMap[pin.ID].Geometries {
			geomCopy = append(geomCopy, &Geometry{
				ID:         geom.ID,
				InComplete: true,
			})
		}
		pinMap[pin.ID].Geometries = geomCopy
		blockPins = append(blockPins, pinMap[pin.ID])
	}
	for _, layer := range design.Layers {
		layerMap[layer.ID] = &(*layer)
		layers = append(layers, layerMap[layer.ID])
	}

	for _, via := range design.RoutingVias {
		viaMap[via.ID] = &(*via)
		if viaMap[via.ID].Rect != nil {
			cp := viaMap[via.ID].Rect.Copy()
			if cp.Layer != nil {
				cp.Layer = &Layer{
					ID:         cp.Layer.ID,
					InComplete: true,
				}
			}
			if cp.Via != nil {
				cp.Via = &Via{
					ID:         cp.Via.ID,
					InComplete: true,
				}
			}
			viaMap[via.ID].Rect = &cp
		}
		routingVias = append(routingVias, viaMap[via.ID])
	}
	for _, via := range design.ViaDefinitions {
		viaMap[via.ID] = &(*via)
		if viaMap[via.ID].Rect != nil {
			cp := viaMap[via.ID].Rect.Copy()
			if cp.Layer != nil {
				cp.Layer = &Layer{
					ID:         cp.Layer.ID,
					InComplete: true,
				}
			}
			if cp.Via != nil {
				cp.Via = &Via{
					ID:         cp.Via.ID,
					InComplete: true,
				}
			}
			viaMap[via.ID].Rect = &cp
		}
		viaDefinitions = append(viaDefinitions, viaMap[via.ID])
	}

	for _, inst := range instanceMap {
		var pins []*Pin
		for _, pin := range inst.Pins {
			pins = append(pins, &Pin{ID: pin.ID, InComplete: true})
		}
		inst.Pins = pins
	}

	for _, pin := range pinMap {
		pin.Instance = nil
		pin.Net = nil
	}
	for _, net := range netMap {
		var pins []*Pin
		for _, pin := range net.Pins {
			pins = append(pins, &Pin{ID: pin.ID, InComplete: true})
		}
		net.Pins = pins
		var edges []*Edge
		for _, edge := range net.Edges {
			edgeCp := *edge
			if edgeCp.Via != nil {
				edgeCp.Via = &Via{ID: edgeCp.Via.ID, InComplete: true}
			}
			if edgeCp.Layer != nil {
				edgeCp.Layer = &Layer{ID: edgeCp.Layer.ID, InComplete: true}
			}
			edges = append(edges, &edgeCp)
		}
		net.Edges = edges
	}
	for _, layer := range layerMap {
		if layer.UpperLayer != nil {
			layer.UpperLayer = &Layer{ID: layer.UpperLayer.ID, InComplete: true}
		}
		if layer.LowerLayer != nil {
			layer.LowerLayer = &Layer{ID: layer.LowerLayer.ID, InComplete: true}
		}
	}
	for _, via := range viaMap {
		if via.TopLayer != nil {
			via.TopLayer = &Layer{ID: via.TopLayer.ID, InComplete: true}
		}
		if via.BottomLayer != nil {
			via.BottomLayer = &Layer{ID: via.BottomLayer.ID, InComplete: true}
		}
		if via.CutLayer != nil {
			via.CutLayer = &Layer{ID: via.CutLayer.ID, InComplete: true}
		}
	}

	for _, geom := range design.Geometries {
		geomCp := geom.Copy()
		geometryMap[geom.ID] = &geomCp
		geometries = append(geometries, &geomCp)
	}
	for _, site := range design.Sites {
		siteMap[site.ID] = &(*site)
		sites = append(sites, &(*site))
	}
	for _, track := range design.Tracks {
		trackCp := track.Copy()
		if trackCp.Layer != nil {
			trackCp.Layer = &Layer{
				ID:         trackCp.Layer.ID,
				InComplete: true,
			}
		}
		trackMap[track.ID] = &trackCp
	}
	for _, row := range design.Rows {
		rowMap[row.ID] = &(*row)
	}

	for _, track := range trackMap {
		if track.Layer != nil {
			track.Layer = &Layer{
				ID:         track.Layer.ID,
				InComplete: true,
			}
		}
		tracks = append(tracks, track)
	}
	for _, row := range rowMap {
		if row.BoundingBox != nil {
			boxCp := row.BoundingBox.Copy()
			if boxCp.Layer != nil {
				boxCp.Layer = &Layer{
					ID:         boxCp.Layer.ID,
					InComplete: true,
				}
			}
			row.BoundingBox = &boxCp
		}
		if row.Site != nil {
			row.Site = &Site{
				ID:         row.Site.ID,
				Name:       row.Site.Name,
				InComplete: false,
			}
		}
		rows = append(rows, row)
	}

	compactDesign.Instances = instances
	compactDesign.Nets = nets
	compactDesign.InstancePins = instancePins
	compactDesign.BlockPins = blockPins
	compactDesign.RoutingVias = routingVias
	compactDesign.ViaDefinitions = viaDefinitions
	compactDesign.Layers = layers
	compactDesign.CoreArea = design.CoreArea
	compactDesign.DieArea = design.DieArea
	compactDesign.DesignArea = design.DesignArea
	compactDesign.Utilization = design.Utilization
	compactDesign.Rows = rows
	compactDesign.Tracks = tracks
	compactDesign.Sites = sites
	compactDesign.Geometries = geometries
	if design.GCell != nil {
		gcellCopy := design.GCell.Copy()
		compactDesign.GCell = &gcellCopy
	}
	bboxCopy := design.BoundingBox.Copy()
	compactDesign.BoundingBox = &bboxCopy
	coreCopy := design.Core.Copy()
	compactDesign.Core = &coreCopy
	dieCopy := design.Die.Copy()
	compactDesign.Die = &dieCopy
	if len(compactDesign.Instances) == 0 {
		compactDesign.Instances = make([]*Instance, 0)
	}
	if len(compactDesign.Instances) == 0 {
		compactDesign.Instances = make([]*Instance, 0)
	}
	if len(compactDesign.Nets) == 0 {
		compactDesign.Nets = make([]*Net, 0)
	}
	if len(compactDesign.InstancePins) == 0 {
		compactDesign.InstancePins = make([]*Pin, 0)
	}
	if len(compactDesign.BlockPins) == 0 {
		compactDesign.BlockPins = make([]*Pin, 0)
	}
	if len(compactDesign.RoutingVias) == 0 {
		compactDesign.RoutingVias = make([]*Via, 0)
	}
	if len(compactDesign.ViaDefinitions) == 0 {
		compactDesign.ViaDefinitions = make([]*Via, 0)
	}
	if len(compactDesign.Layers) == 0 {
		compactDesign.Layers = make([]*Layer, 0)
	}
	if len(compactDesign.Rows) == 0 {
		compactDesign.Rows = make([]*Row, 0)
	}
	if len(compactDesign.Tracks) == 0 {
		compactDesign.Tracks = make([]*Grid, 0)
	}
	if len(compactDesign.Sites) == 0 {
		compactDesign.Sites = make([]*Site, 0)
	}
	if len(compactDesign.Geometries) == 0 {
		compactDesign.Geometries = make([]*Geometry, 0)
	}

	return
}

func (ref C.Point) Point() *Point {
	return &Point{X: int(ref.x), Y: int(ref.y)}
}

func (ref *C.Rect) Rect(idOnly bool) *Rect {
	rect := &Rect{
		ID:         int(ref.id),
		XMin:       int(ref.xMin),
		YMin:       int(ref.yMin),
		XMax:       int(ref.xMax),
		YMax:       int(ref.yMax),
		ShapeType:  int(ref.shapeType),
		Layer:      nil,
		Via:        nil,
		InComplete: idOnly,
	}
	if ref.layer != nil {
		rect.Layer = ref.layer.Layer(idOnly)
	}
	if ref.via != nil {
		rect.Via = ref.via.Via(idOnly)
	}
	return rect
}

func (ref *C.Edge) Edge() *Edge {
	var via *Via = nil
	var layer *Layer = nil
	if ref.via != nil {
		via = ref.via.Via(true)
	}
	if ref.layer != nil {
		layer = ref.layer.Layer(true)
	}
	return &Edge{
		Type:  EdgeType(ref.edgeType),
		Rect:  ref.rect.Rect(false),
		Via:   via,
		Layer: layer,
	}
}

func (ref *C.Instance) Instance(idOnly bool) *Instance {
	if idOnly {
		// Temporary holder
		return &Instance{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	return &Instance{
		ID:           int(ref.id),
		Name:         C.GoString(ref.name),
		Location:     ref.location.Point(),
		Origin:       ref.origin.Point(),
		Orientation:  Orientation(ref.orientation),
		Master:       C.GoString(ref.master),
		Pins:         dbPinArrayToSlice(ref.pins, int(ref.pinSz), true),
		IsPlaced:     ref.isPlaced == 1,
		BoundingBox:  ref.boundingBox.Rect(false),
		Halo:         ref.halo.Rect(false),
		IsFiller:     ref.isFiller == 1,
		MasterType:   MasterType(ref.masterType),
		Obstructions: ref.obstructions.Geometry(idOnly),
		InComplete:   idOnly,
	}
}

func (ref *C.Pin) Pin(idOnly bool) *Pin {
	if idOnly {
		// Temporary holder
		return &Pin{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	var net *Net = nil
	var inst *Instance = nil
	if ref.net != nil {
		net = ref.net.Net(true)
	}
	if ref.instance != nil {
		inst = ref.instance.Instance(true)
	}
	return &Pin{
		ID:         int(ref.id),
		Name:       C.GoString(ref.name),
		Instance:   inst,
		Net:        net,
		Direction:  Direction(ref.direction),
		Location:   ref.location.Point(),
		Geometries: dbGeometryArrayToSlice(ref.geometries, int(ref.geometrySz), idOnly),
		IsBlock:    ref.isBlock == 1,
		IsSpecial:  ref.isSpecial == 1,
		SignalType: SignalType(ref.signalType),
		InComplete: idOnly,
	}
}
func (ref *C.Geometry) Geometry(idOnly bool) *Geometry {
	if idOnly {
		// Temporary holder
		return &Geometry{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	return &Geometry{
		ID:         int(ref.id),
		Boxes:      dbRectArrayToSlice(ref.boxes, int(ref.boxSz), idOnly),
		InComplete: false,
	}
}
func (ref *C.Net) Net(idOnly bool) *Net {
	if idOnly {
		// Temporary holder
		return &Net{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	var specialBoxes []*Geometry
	if ref.specialBoxes != nil {
		specialBoxes = dbGeometryArrayToSlice(ref.specialBoxes, int(ref.specialBoxSz), idOnly)
	}
	return &Net{
		ID:           int(ref.id),
		Name:         C.GoString(ref.name),
		IsSpecial:    ref.isSpecial == 1,
		IsRouted:     ref.isRouted == 1,
		Pins:         dbPinArrayToSlice(ref.pins, int(ref.pinSz), true),
		Edges:        dbEdgeArrayToSlice(ref.edges, int(ref.edgeSz)),
		SpecialBoxes: specialBoxes,
		InComplete:   idOnly,
	}
}
func (ref *C.Layer) Layer(idOnly bool) *Layer {
	if idOnly {
		// Temporary holder
		return &Layer{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	var upperLayer *Layer = nil
	var lowerLayer *Layer = nil
	if ref.upperLayer != nil {
		upperLayer = ref.upperLayer.Layer(true)
	}
	if ref.lowerLayer != nil {
		lowerLayer = ref.lowerLayer.Layer(true)
	}
	return &Layer{
		ID:         int(ref.id),
		Name:       C.GoString(ref.name),
		Alias:      C.GoString(ref.alias),
		Width:      int(ref.width),
		Spacing:    int(ref.spacing),
		Area:       float64(ref.area),
		Type:       LayerType(ref.layerType),
		Direction:  Direction(ref.direction),
		UpperLayer: upperLayer,
		LowerLayer: lowerLayer,
		InComplete: idOnly,
	}
}
func (ref *C.Via) Via(idOnly bool) *Via {
	if idOnly {
		// Temporary holder
		return &Via{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	var topLayer *Layer = nil
	var bottomLayer *Layer = nil
	var cutLayer *Layer = nil
	if ref.topLayer != nil {
		topLayer = ref.topLayer.Layer(true)
	}
	if ref.bottomLayer != nil {
		bottomLayer = ref.bottomLayer.Layer(true)
	}
	if ref.cutLayer != nil {
		cutLayer = ref.cutLayer.Layer(true)
	}
	return &Via{
		ID:          int(ref.id),
		Name:        C.GoString(ref.name),
		Rect:        ref.rect.Rect(false),
		IsBlock:     ref.isBlock == 1,
		IsTech:      ref.isTech == 1,
		TopLayer:    topLayer,
		BottomLayer: bottomLayer,
		CutLayer:    cutLayer,
		InComplete:  idOnly,
	}
}
func (ref *C.Site) Site(idOnly bool) *Site {
	if idOnly {
		// Temporary holder
		return &Site{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	return &Site{
		ID:         int(ref.id),
		Name:       C.GoString(ref.name),
		InComplete: idOnly,
	}
}
func (ref *C.Grid) Grid(idOnly bool) *Grid {
	if idOnly {
		// Temporary haolder
		return &Grid{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	var layer *Layer = nil
	if ref.layer != nil {
		layer = ref.layer.Layer(true)
	}
	return &Grid{
		ID:                     int(ref.id),
		Layer:                  layer,
		GridX:                  intArrayToSlice(ref.gridX, int(ref.gridXSz)),
		GridY:                  intArrayToSlice(ref.gridY, int(ref.gridYSz)),
		GridXPatternOrigins:    intArrayToSlice(ref.gridXPatternOrigins, int(ref.gridXPatternSz)),
		GridXPatternLineCounts: intArrayToSlice(ref.gridXPatternLineCounts, int(ref.gridXPatternSz)),
		GridXPatternSteps:      intArrayToSlice(ref.gridXPatternSteps, int(ref.gridXPatternSz)),
		GridYPatternOrigins:    intArrayToSlice(ref.gridYPatternOrigins, int(ref.gridYPatternSz)),
		GridYPatternLineCounts: intArrayToSlice(ref.gridYPatternLineCounts, int(ref.gridYPatternSz)),
		GridYPatternSteps:      intArrayToSlice(ref.gridYPatternSteps, int(ref.gridYPatternSz)),
		InComplete:             idOnly,
	}
}

func (ref *C.Row) Row(idOnly bool) *Row {
	if idOnly {
		// Temporary holder
		return &Row{
			ID:         int(ref.id),
			InComplete: idOnly,
		}
	}
	var site *Site = nil
	if ref.site != nil {
		site = ref.site.Site(true)
	}
	return &Row{
		ID:          int(ref.id),
		Name:        C.GoString(ref.name),
		Site:        site,
		Direction:   Direction(ref.direction),
		Orientation: Orientation(ref.orientation),
		OriginX:     int(ref.originX),
		OriginY:     int(ref.originY),
		Spacing:     int(ref.spacing),
		BoundingBox: ref.boundingBox.Rect(false),
		InComplete:  idOnly,
	}

}

func doubleArrayToSlice(array *C.double, len int) []C.double {
	var list []C.double
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	return list
}

func dbInstanceArrayToSlice(array **C.Instance, len int, idOnly bool) []*Instance {
	var list []*C.Instance
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var insts []*Instance
	for _, inst := range list {
		insts = append(insts, inst.Instance(idOnly))
	}
	return insts
}
func dbEdgeArrayToSlice(array *C.Edge, len int) []*Edge {
	var list []C.Edge
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var edges []*Edge
	for _, edge := range list {
		edges = append(edges, edge.Edge())
	}
	return edges
}
func dbPinArrayToSlice(array **C.Pin, len int, idOnly bool) []*Pin {
	var list []*C.Pin
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var pins []*Pin
	for _, pin := range list {
		pins = append(pins, pin.Pin(idOnly))
	}
	return pins
}
func dbRectArrayToSlice(array **C.Rect, len int, idOnly bool) []*Rect {
	var list []*C.Rect
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var rects []*Rect
	for _, rect := range list {
		rects = append(rects, rect.Rect(idOnly))
	}
	return rects
}
func dbGeometryArrayToSlice(array **C.Geometry, len int, idOnly bool) []*Geometry {
	var list []*C.Geometry
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var geoms []*Geometry
	for _, geom := range list {
		geoms = append(geoms, geom.Geometry(idOnly))
	}
	return geoms
}

func dbNetArrayToSlice(array **C.Net, len int, idOnly bool) []*Net {
	var list []*C.Net
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var nets []*Net
	for _, net := range list {
		nets = append(nets, net.Net(idOnly))
	}
	return nets
}

func dbLayerArrayToSlice(array **C.Layer, len int, idOnly bool) []*Layer {
	var list []*C.Layer
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var layers []*Layer
	for _, layer := range list {
		layers = append(layers, layer.Layer(idOnly))
	}
	return layers
}

func dbViaArrayToSlice(array **C.Via, len int, idOnly bool) []*Via {
	var list []*C.Via
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var vias []*Via
	for _, via := range list {
		vias = append(vias, via.Via(idOnly))
	}
	return vias
}
func dbRowArrayToSlice(array **C.Row, len int, idOnly bool) []*Row {
	var list []*C.Row
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var Rows []*Row
	for _, Row := range list {
		Rows = append(Rows, Row.Row(idOnly))
	}
	return Rows
}
func dbSiteArrayToSlice(array **C.Site, len int, idOnly bool) []*Site {
	var list []*C.Site
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var Sites []*Site
	for _, Site := range list {
		Sites = append(Sites, Site.Site(idOnly))
	}
	return Sites
}
func dbTrackArrayToSlice(array **C.Grid, len int, idOnly bool) []*Grid {
	var list []*C.Grid
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var Tracks []*Grid
	for _, Grid := range list {
		Tracks = append(Tracks, Grid.Grid(idOnly))
	}
	return Tracks
}
func intArrayToSlice(array *C.int, len int) []int {
	var list []C.int
	sliceHeader := (*reflect.SliceHeader)((unsafe.Pointer(&list)))
	sliceHeader.Cap = len
	sliceHeader.Len = len
	sliceHeader.Data = uintptr(unsafe.Pointer(array))
	var ints []int
	for _, num := range list {
		ints = append(ints, int(num))
	}
	return ints
}

func generateLibraryName(filepath string) string {
	return strings.TrimSuffix(path.Base(filepath), path.Ext(filepath))
}

// ParseDesign parses user uploaded files
func ParseDesign(files *DesignFiles) (design *Design, err error) {
	// Validate design files
	var hasTech = false
	var hasLib = false
	if len(files.LEF) == 0 {
		err = fmt.Errorf("At least one LEF file is required")
		return
	}
	if files.DEF == nil {
		err = fmt.Errorf("One DEF file is required")
		return
	}
	for _, file := range files.LEF {
		if file.IsTech {
			if hasTech {
				err = fmt.Errorf("Only one LEF technology file is allowed")
				return
			}
			hasTech = true
		}
		if file.IsLibrary {
			hasLib = true
		}
		if !file.IsLibrary && !file.IsTech {
			err = fmt.Errorf("LEF file must be technology or library file")
			return
		}
	}
	if !hasTech {
		err = fmt.Errorf("LEF technology file is required")
		return
	}
	if !hasLib {
		err = fmt.Errorf("LEF library file is required")
		return
	}
	var db OpenDB
	db, err = NewDatabase()
	if err != nil {
		return
	}
	defer db.FreeDatabase()
	for _, file := range files.LEF {
		if file.IsTech && file.IsLibrary {
			err = db.ParseLEF(file.FilePath)
		} else if file.IsTech {
			err = db.ParseLEFTechnology(file.FilePath)
		} else if file.IsLibrary {
			err = db.ParseLEFLibrary(file.FilePath)
		}
		if err != nil {
			err = fmt.Errorf("error parsing LEF file(s): %v", err)
			return
		}
	}
	err = db.ParseDEF(files.DEF.FilePath)
	if err != nil {
		err = fmt.Errorf("error parsing DEF file(s): %v", err)
		return
	}
	design, err = db.GetDesign()
	if err != nil {
		err = fmt.Errorf("%v", err)
		return
	}
	return design, err
}

// ParseDesign parses user uploaded files into JSON
func ParseDesignToJSON(files *DesignFiles, compress bool) (designBytes []byte, err error) {
	design, err := ParseDesign(files)
	if err != nil {
		return nil, err
	}
	compactDesign := design.CompactDesign()
	var buf bytes.Buffer
	if compress {
		gz := gzip.NewWriter(&buf)
		enc := json.NewEncoder(gz)
		enc.Encode(compactDesign)
		gz.Close()
	} else {
		enc := json.NewEncoder(&buf)
		// Uncomment for a formatted JSON
		// enc.SetIndent("", "    ")
		enc.Encode(compactDesign)
	}
	designBytes = buf.Bytes()
	return
}
