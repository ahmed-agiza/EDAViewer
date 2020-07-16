// goopendb.cpp
#include "goopendb.h"
#include "opendb/db.h"
#include "opendb/dbRtTree.h"
#include "opendb/dbTypes.h"
#include "opendb/defin.h"
#include "opendb/geom.h"
#include "opendb/lefin.h"
#include <map>
#include <memory>
#include <signal.h>
#include <vector>

dbDatabase DatabaseNew(void) {
  odb::dbDatabase *ret = odb::dbDatabase::create();
  if (ret == nullptr) {
    LastError = "Failed to initialize OpenDB";
    return nullptr;
  }
  return (dbDatabase)ret;
}
int DatabaseFree(dbDatabase db) {
  odb::dbDatabase::destroy((odb::dbDatabase *)db);
  return 0;
}

int ReadDesign(dbDatabase dbPtr, const char *filepath) {
  odb::dbDatabase *db = (odb::dbDatabase *)dbPtr;
  odb::defin defReader(db);
  defReader.continueOnErrors();
  std::vector<odb::dbLib *> searchLibs;
  for (odb::dbLib *lib : db->getLibs()) {
    searchLibs.push_back(lib);
  }
  odb::dbChip *chip = defReader.createChip(searchLibs, filepath);
  if (chip == nullptr) {
    LastError = "Failed to parse DEF file";
    return 1;
  }
  return 0;
}

int ReadLib(dbDatabase dbPtr, const char *filepath, const char *libname) {
  odb::dbDatabase *db = (odb::dbDatabase *)dbPtr;
  odb::lefin lefReader(db, false);
  odb::dbLib *lib = lefReader.createLib(libname, filepath);
  if (lib == nullptr) {
    LastError = "Failed to parse LEF file";
    return 1;
  }
  return 0;
}

int ReadTech(dbDatabase dbPtr, const char *filepath) {
  odb::dbDatabase *db = (odb::dbDatabase *)dbPtr;
  odb::lefin lefReader(db, false);
  odb::dbTech *tech = lefReader.createTech(filepath);
  if (tech == nullptr) {
    LastError = "Failed to parse LEF file";
    return 1;
  }
  return 0;
}

int ReadTechAndLib(dbDatabase dbPtr, const char *filepath,
                   const char *libname) {
  odb::dbDatabase *db = (odb::dbDatabase *)dbPtr;
  odb::lefin lefReader(db, false);
  odb::dbLib *lib = lefReader.createTechAndLib(libname, filepath);
  if (lib == nullptr) {
    LastError = "Failed to parse LEF file";
    return 1;
  }
  return 0;
}

int HasTech(dbDatabase dbPtr) {
  odb::dbDatabase *db = (odb::dbDatabase *)dbPtr;
  return db->getTech() != nullptr;
}

double DbuToMeters(dbDatabase dbPtr, int dist) {
  odb::dbDatabase *db = (odb::dbDatabase *)dbPtr;
  return dist / (db->getTech()->getDbUnitsPerMicron() * 1e+6);
}

Design *GetDesign(dbDatabase dbPtr) {
  odb::dbDatabase *db = (odb::dbDatabase *)dbPtr;

  Design *design = (Design *)malloc(sizeof(Design));

  odb::dbBlock *block = db->getChip()->getBlock();
  odb::dbSet<odb::dbInst> instanceSet = block->getInsts();
  odb::dbSet<odb::dbITerm> itermSet = block->getITerms();
  odb::dbSet<odb::dbBTerm> btermSet = block->getBTerms();
  odb::dbSet<odb::dbNet> netSet = block->getNets();
  odb::dbSet<odb::dbVia> viaDefinitionSet = block->getVias();
  odb::dbSet<odb::dbTechLayer> layerSet = db->getTech()->getLayers();
  odb::dbSet<odb::dbTrackGrid> trackGridSet = block->getTrackGrids();
  odb::dbGCellGrid *gcellGrid = block->getGCellGrid();
  odb::dbSet<odb::dbRow> rowSet = block->getRows();
  odb::dbSet<odb::dbLib> libSet = db->getLibs();

  design->name = strdup(block->getConstName());

  std::map<uint, Rect *> rectMap;
  std::map<uint, Instance *> instanceMap;
  std::map<uint, Pin *> instancePinMap;
  std::map<uint, Pin *> blockPinMap;
  std::map<uint, Net *> netMap;
  std::map<uint, Via *> viaMap;
  std::map<uint, Via *> routingViaMap;
  std::map<uint, Layer *> layerMap;
  std::map<uint, Site *> siteMap;
  std::map<uint, std::map<uint, Geometry *>>
      mpinGeometryMap; // master -> mpin -> geom
  std::map<uint, Geometry *> masterObsGeometryMap;
  std::map<uint, Geometry *> geometryMap;
  uint geometryId = 1;
  uint rectId = 1;

  /** Collect database objects **/
  // Layers
  design->layerSz = layerSet.size();
  Layer **layers = (Layer **)malloc(design->layerSz * sizeof(Layer *));
  int index = 0;
  for (odb::dbSet<odb::dbTechLayer>::iterator it = layerSet.begin();
       it != layerSet.end(); ++it) {
    Layer *layer = (Layer *)malloc(sizeof(Layer));
    layer->id = it->getId();
    layer->name = strdup(it->getConstName());
    layer->width = it->getWidth();
    layer->spacing = it->getSpacing();
    layer->upperLayer = nullptr;
    layer->lowerLayer = nullptr;
    layer->area = it->getArea();
    layer->alias = 0;
    if (it->hasAlias()) {
      layer->alias = strdup(it->getAlias().c_str());
    }
    odb::dbTechLayerType typ = it->getType();
    odb::dbTechLayerDir dir = it->getDirection();
    layer->layerType = castLayerType(&typ);
    layer->direction = castLayerDirection(&dir);
    layer->dbObject = (void *)*it;
    layers[index++] = layer;
    layerMap[it->getId()] = layer;
  }
  design->layers = layers;

  // Instances
  design->instanceSz = instanceSet.size();
  Instance **instances =
      (Instance **)malloc(design->instanceSz * sizeof(Instance *));
  index = 0;
  for (odb::dbSet<odb::dbInst>::iterator it = instanceSet.begin();
       it != instanceSet.end(); ++it) {
    Instance *inst = (Instance *)malloc(sizeof(Instance));
    inst->id = it->getId();
    inst->name = strdup(it->getConstName());
    Point loc;
    Point origin;
    int x, y;
    it->getLocation(x, y);
    loc.x = x;
    loc.y = y;
    inst->location = loc;
    it->getOrigin(x, y);
    origin.x = x;
    origin.y = y;
    inst->origin = origin;
    odb::dbOrientType orient = it->getOrient();
    inst->orientation = castOrientation((void *)&(orient));
    inst->master = strdup(it->getMaster()->getConstName());
    inst->isPlaced = it->isPlaced();
    inst->boundingBox = castBox(it->getBBox(), rectId++);
    inst->halo = castBox(it->getHalo(), rectId++);
    rectMap[inst->boundingBox->id] = inst->boundingBox;
    rectMap[inst->halo->id] = inst->halo;

    inst->isFiller = it->getMaster()->isFiller();
    odb::dbMasterType masterType = it->getMaster()->getType();
    inst->masterType = castMasterType(&masterType);

    if (masterObsGeometryMap.count(it->getMaster()->getId())) {
      inst->obstructions = masterObsGeometryMap[it->getMaster()->getId()];
    } else {
      Geometry *geom = (Geometry *)malloc(sizeof(Geometry));
      odb::dbSet<odb::dbBox> obs = it->getMaster()->getObstructions();
      geom->id = geometryId++;
      geom->boxSz = obs.size();
      geom->boxes = (Rect **)malloc(geom->boxSz * sizeof(Rect *));
      int boxIndex = 0;
      for (odb::dbSet<odb::dbBox>::iterator boxIt = obs.begin();
           boxIt != obs.end(); ++boxIt) {
        Rect *box = castBox(*boxIt, rectId++);
        geom->boxes[boxIndex++] = box;
        rectMap[box->id] = box;
      }
      masterObsGeometryMap[it->getMaster()->getId()] = geom;
      masterObsGeometryMap[it->getMaster()->getId()] = geom;
      geometryMap[geom->id] = geom;
      inst->obstructions = geom;
    }

    inst->dbObject = (void *)*it;
    instances[index++] = inst;
    instanceMap[it->getId()] = inst;
  }
  design->instances = instances;

  // Instance pins
  design->instancePinSz = itermSet.size();
  Pin **instancePins = (Pin **)malloc(design->instancePinSz * sizeof(Pin *));
  index = 0;
  for (odb::dbSet<odb::dbITerm>::iterator it = itermSet.begin();
       it != itermSet.end(); ++it) {
    Pin *pin = (Pin *)malloc(sizeof(Pin));
    pin->id = it->getId();
    pin->name = strdup(it->getMTerm()->getConstName());
    odb::dbIoType ioType = it->getIoType();
    pin->direction = castIoType((void *)&ioType);
    odb::dbSigType sigType = it->getSigType();
    pin->signalType = castSignalType((void *)&sigType);
    Point loc;
    int x, y;
    it->getAvgXY(&x, &y);
    loc.x = x;
    loc.y = y;
    pin->location = loc;
    odb::dbMTerm *mterm = it->getMTerm();
    pin->geometries = nullptr;
    pin->geometrySz = 0;
    if (mterm) {
      odb::dbMaster *master = it->getMTerm()->getMaster();
      odb::dbSet<odb::dbMPin> mpins = mterm->getMPins();
      pin->geometrySz = mpins.size();
      Geometry **masterPinGeomtries =
          (Geometry **)malloc(pin->geometrySz * sizeof(Geometry *));
      int geomIndex = 0;
      for (odb::dbSet<odb::dbMPin>::iterator mpinIt = mpins.begin();
           mpinIt != mpins.end(); ++mpinIt) {

        if (mpinGeometryMap.count(master->getId()) &&
            mpinGeometryMap[master->getId()].count(mpinIt->getId())) {
          masterPinGeomtries[geomIndex++] =
              mpinGeometryMap[master->getId()][mpinIt->getId()];
        } else {
          Geometry *geom = (Geometry *)malloc(sizeof(Geometry));
          geom->id = geometryId++;
          odb::dbSet<odb::dbBox> boxes = mpinIt->getGeometry();
          geom->boxSz = boxes.size();
          geom->boxes = (Rect **)malloc(geom->boxSz * sizeof(Rect *));
          int boxIndex = 0;
          for (odb::dbSet<odb::dbBox>::iterator boxIt = boxes.begin();
               boxIt != boxes.end(); ++boxIt) {
            Rect *box = castBox(*boxIt, rectId++);
            geom->boxes[boxIndex++] = box;
            rectMap[box->id] = box;
          }
          mpinGeometryMap[master->getId()][mpinIt->getId()] = geom;
          geometryMap[geom->id] = geom;
          masterPinGeomtries[geomIndex++] = geom;
        }
      }
      pin->geometries = masterPinGeomtries;
    }
    pin->net = nullptr;
    pin->instance = nullptr;
    pin->dbObject = (void *)*it;
    pin->isBlock = false;
    pin->isSpecial = it->isSpecial();
    instancePins[index++] = pin;
    instancePinMap[it->getId()] = pin;
  }
  design->instancePins = instancePins;

  // Block pins
  design->blockPinSz = btermSet.size();
  Pin **blockPins = (Pin **)malloc(design->blockPinSz * sizeof(Pin *));
  index = 0;
  for (odb::dbSet<odb::dbBTerm>::iterator it = btermSet.begin();
       it != btermSet.end(); ++it) {
    Pin *pin = (Pin *)malloc(sizeof(Pin));
    pin->id = it->getId();
    pin->name = strdup(it->getConstName());
    odb::dbIoType ioType = it->getIoType();
    pin->direction = castIoType((void *)&ioType);
    pin->net = nullptr;
    pin->instance = nullptr;
    odb::dbSigType sigType = it->getSigType();
    pin->signalType = castSignalType((void *)&sigType);
    pin->isSpecial = it->isSpecial();

    // Physical BPins
    odb::dbSet<odb::dbBPin> physPins = it->getBPins();
    pin->geometrySz = 1;

    Geometry **pinGeomtries =
        (Geometry **)malloc(pin->geometrySz * sizeof(Geometry *));
    pinGeomtries[0] = (Geometry *)malloc(sizeof(Geometry));
    pinGeomtries[0]->boxSz = physPins.size();
    pinGeomtries[0]->boxes =
        (Rect **)malloc(pinGeomtries[0]->boxSz * sizeof(Rect *));
    pinGeomtries[0]->id = geometryId++;
    geometryMap[pinGeomtries[0]->id] = pinGeomtries[0];

    int physPinIndex = 0;
    for (odb::dbSet<odb::dbBPin>::iterator pinIt = physPins.begin();
         pinIt != physPins.end(); pinIt++) {
      Rect *rect = castBox(pinIt->getBox(), rectId++);
      pinGeomtries[0]->boxes[physPinIndex++] = rect;
      rectMap[rect->id] = rect;
    }
    pin->geometries = pinGeomtries;

    pin->dbObject = (void *)*it;
    pin->isBlock = true;
    blockPins[index++] = pin;
    blockPinMap[it->getId()] = pin;
  }
  design->blockPins = blockPins;

  // Vias
  design->viaDefinitionSz = viaDefinitionSet.size();
  Via **viaDefinitions =
      (Via **)malloc(design->viaDefinitionSz * sizeof(Via *));
  index = 0;
  for (odb::dbSet<odb::dbVia>::iterator it = viaDefinitionSet.begin();
       it != viaDefinitionSet.end(); ++it) {
    Via *via = (Via *)malloc(sizeof(Via));
    odb::dbSet<odb::dbBox> boxes = it->getBoxes();
    via->id = it->getId();
    via->name = strdup(it->getConstName());
    via->topLayer = nullptr;
    via->bottomLayer = nullptr;
    via->cutLayer = nullptr;
    odb::dbTechLayer *top = it->getTopLayer();
    odb::dbTechLayer *bottom = it->getBottomLayer();
    if (top) {
      int layerId = top->getId();
      if (!layerMap.count(layerId)) {
        fprintf(stderr, "Error parsing %s\n", top->getConstName());
      } else {
        via->topLayer = layerMap[layerId];
      }
    }
    if (bottom) {
      int layerId = bottom->getId();
      if (!layerMap.count(layerId)) {
        fprintf(stderr, "Error parsing %s\n", bottom->getConstName());
      } else {
        via->bottomLayer = layerMap[layerId];
      }
    }
    if (it->hasParams()) {
      odb::dbViaParams viaParams;
      it->getViaParams(viaParams);
      if (viaParams.getCutLayer()) {
        via->cutLayer = layerMap[viaParams.getCutLayer()->getId()];
      }
    }
    Rect *rect = castBox(it->getBBox(), rectId++);
    rectMap[rect->id] = rect;
    via->rect = rect;
    via->isBlock = (it->getBlockVia() != nullptr);
    via->isTech = (it->getTechVia() != nullptr);
    via->dbObject = (void *)*it;
    viaDefinitions[index++] = via;
    viaMap[it->getId()] = via;
  }
  design->viaDefinitions = viaDefinitions;

  // Nets
  design->netSz = netSet.size();
  Net **nets = (Net **)malloc(design->netSz * sizeof(Net *));
  index = 0;
  for (odb::dbSet<odb::dbNet>::iterator it = netSet.begin(); it != netSet.end();
       ++it) {
    Net *net = (Net *)malloc(sizeof(Net));
    odb::dbWire *wire = it->getWire();
    net->id = it->getId();
    net->name = strdup(it->getConstName());
    net->isSpecial = it->isSpecial();
    odb::dbWireType wireType = it->getWireType();
    net->isRouted =
        wire != nullptr || wireType == odb::dbWireType::Value::ROUTED;
    net->wireType = castWireType((void *)&wireType);
    net->dbObject = (void *)*it;
    nets[index++] = net;
    netMap[it->getId()] = net;
    net->edgeSz = 0;
    net->edges = nullptr;
    net->specialBoxes = nullptr;
    net->specialBoxSz = 0;
    if (wire) {
      odb::dbRtTree wireTree;
      wireTree.decode(wire, true);
      int edgeCount = 0;
      odb::dbRtTree::edge_iterator edgeIt;
      for (edgeIt = wireTree.begin_edges(); edgeIt != wireTree.end_edges();
           ++edgeIt) {
        edgeCount++;
      }
      net->edgeSz = edgeCount;
      net->edges = (Edge *)malloc(net->edgeSz * sizeof(Edge));
      int edgeIndex = 0;
      for (edgeIt = wireTree.begin_edges(); edgeIt != wireTree.end_edges();
           ++edgeIt) {
        odb::dbRtEdge *rtEdge = *edgeIt;
        Edge edge;
        edge.via = nullptr;
        edge.layer = nullptr;
        edge.edgeType = castEdgeType(rtEdge->getType());
        odb::Rect edgeBox;
        rtEdge->getBBox(edgeBox);
        edge.rect = castRect((void *)&edgeBox, rectId++);
        rectMap[edge.rect->id] = edge.rect;
        odb::dbTechLayer *layer = rtEdge->getSource()->getLayer();
        if (layer) {
          int layerId = layer->getId();
          if (!layerMap.count(layerId)) {
            fprintf(stderr, "Error parsing %s\n", layer->getConstName());
          } else {
            edge.layer = layerMap[layerId];
          }
        }
        if (rtEdge->getType() == odb::dbRtEdge::Type::SEGMENT) {
          // odb::dbRtSegment *casted = (odb::dbRtSegment *)rtEdge;
        } else if (rtEdge->getType() == odb::dbRtEdge::Type::SHORT) {
          // odb::dbRtShort *casted = (odb::dbRtShort *)rtEdge;
        } else if (rtEdge->getType() == odb::dbRtEdge::Type::VWIRE) {
          // odb::dbRtVWire *casted = (odb::dbRtVWire *)rtEdge;
        } else if (rtEdge->getType() == odb::dbRtEdge::Type::TECH_VIA) {
          odb::dbRtTechVia *casted = (odb::dbRtTechVia *)rtEdge;
          odb::dbTechVia *dbVia = casted->getVia();
          int viaId = dbVia->getId();
          if (viaMap.count(viaId)) {
            edge.via = viaMap[viaId];
          } else {
            Via *via = (Via *)malloc(sizeof(Via));
            via->id = dbVia->getId();
            via->name = strdup(dbVia->getConstName());
            via->topLayer = nullptr;
            via->bottomLayer = nullptr;
            via->cutLayer = nullptr;
            Rect *rect = castBox(dbVia->getBBox(), rectId++);
            rectMap[rect->id] = rect;
            via->rect = rect;
            via->isBlock = false;
            via->isTech = true;
            odb::dbTechLayer *top = dbVia->getTopLayer();
            odb::dbTechLayer *bottom = dbVia->getBottomLayer();
            if (top) {
              int layerId = top->getId();
              if (!layerMap.count(layerId)) {
                fprintf(stderr, "Error parsing %s\n", top->getConstName());
              } else {
                via->topLayer = layerMap[layerId];
              }
            }
            if (bottom) {
              int layerId = bottom->getId();
              if (!layerMap.count(layerId)) {
                fprintf(stderr, "Error parsing %s\n", bottom->getConstName());
              } else {
                via->bottomLayer = layerMap[layerId];
              }
            }
            if (dbVia->hasParams()) {
              odb::dbViaParams viaParams;
              dbVia->getViaParams(viaParams);
              if (viaParams.getCutLayer()) {
                via->cutLayer = layerMap[viaParams.getCutLayer()->getId()];
              }
            }
            via->dbObject = (void *)dbVia;
            routingViaMap[dbVia->getId()] = via;
            viaMap[dbVia->getId()] = via;
            edge.via = via;
          }
        } else if (rtEdge->getType() == odb::dbRtEdge::Type::VIA) {
          odb::dbRtVia *casted = (odb::dbRtVia *)rtEdge;
          odb::dbVia *dbVia = casted->getVia();
          int viaId = dbVia->getId();
          if (viaMap.count(viaId)) {
            edge.via = viaMap[viaId];
          } else {
            Via *via = (Via *)malloc(sizeof(Via));
            via->id = dbVia->getId();
            via->name = strdup(dbVia->getConstName());
            via->topLayer = nullptr;
            via->bottomLayer = nullptr;
            via->cutLayer = nullptr;
            odb::dbTechLayer *top = dbVia->getTopLayer();
            odb::dbTechLayer *bottom = dbVia->getBottomLayer();
            if (top) {
              int layerId = top->getId();
              if (!layerMap.count(layerId)) {
                fprintf(stderr, "Error parsing %s\n", top->getConstName());
              } else {
                via->topLayer = layerMap[layerId];
              }
            }
            if (bottom) {
              int layerId = bottom->getId();
              if (!layerMap.count(layerId)) {
                fprintf(stderr, "Error parsing %s\n", bottom->getConstName());
              } else {
                via->bottomLayer = layerMap[layerId];
              }
            }
            if (dbVia->hasParams()) {
              odb::dbViaParams viaParams;
              dbVia->getViaParams(viaParams);
              if (viaParams.getCutLayer()) {
                via->cutLayer = layerMap[viaParams.getCutLayer()->getId()];
              }
            }
            Rect *rect = castBox(dbVia->getBBox(), rectId++);
            rectMap[rect->id] = rect;
            via->rect = rect;
            via->isBlock = (dbVia->getBlockVia() != nullptr);
            via->isTech = (dbVia->getTechVia() != nullptr);
            via->dbObject = (void *)dbVia;
            routingViaMap[dbVia->getId()] = via;
            viaMap[dbVia->getId()] = via;
            edge.via = via;
          }
        }

        net->edges[edgeIndex++] = edge;
      }
    }

    odb::dbSet<odb::dbSWire> swires = it->getSWires();
    if (swires.size()) {
      net->specialBoxSz = swires.size();
      Geometry **specialBoxes =
          (Geometry **)malloc(net->specialBoxSz * sizeof(Geometry *));
      int geomIndex = 0;
      for (odb::dbSet<odb::dbSWire>::iterator swireIt = swires.begin();
           swireIt != swires.end(); ++swireIt) {
        odb::dbSet<odb::dbSBox> boxes = swireIt->getWires();
        Geometry *geom = (Geometry *)malloc(sizeof(Geometry));
        geom->id = geometryId++;
        geom->boxSz = boxes.size();
        geom->boxes = (Rect **)malloc(geom->boxSz * sizeof(Rect *));
        int boxIndex = 0;
        for (odb::dbSet<odb::dbSBox>::iterator boxIt = boxes.begin();
             boxIt != boxes.end(); ++boxIt) {
          Rect *box = castBox(*boxIt, rectId++);
          odb::dbWireShapeType shapeType = boxIt->getWireShapeType();
          box->shapeType = castWireShapeType((void *)&shapeType);
          if (boxIt->getTechVia()) {
            box->via = viaMap[boxIt->getTechVia()->getId()];
          } else if (boxIt->getBlockVia()) {
            box->via = viaMap[boxIt->getBlockVia()->getId()];
          }
          geom->boxes[boxIndex++] = box;
          rectMap[box->id] = box;
        }
        geometryMap[geom->id] = geom;
        specialBoxes[geomIndex++] = geom;
      }
      net->specialBoxes = specialBoxes;
    }
  }

  design->nets = nets;

  /** Routing VIAs **/
  design->routingViaSz = routingViaMap.size();
  design->routingVias = (Via **)malloc(design->routingViaSz * sizeof(Via *));
  index = 0;
  for (std::map<uint, Via *>::iterator it = routingViaMap.begin();
       it != routingViaMap.end(); ++it) {
    design->routingVias[index++] = it->second;
  }

  /** Sites **/
  for (odb::dbSet<odb::dbLib>::iterator it = libSet.begin(); it != libSet.end();
       ++it) {
    odb::dbSet<odb::dbSite> sites = it->getSites();
    for (odb::dbSet<odb::dbSite>::iterator siteIt = sites.begin();
         siteIt != sites.end(); ++siteIt) {
      Site *site = (Site *)malloc(sizeof(Site));
      site->id = siteIt->getId();
      site->name = strdup(siteIt->getConstName());
      site->dbObject = (void *)*siteIt;
      siteMap[siteIt->getId()] = site;
    }
  }
  design->siteSz = siteMap.size();
  design->sites = (Site **)malloc(design->siteSz * sizeof(Site *));
  index = 0;
  for (std::map<uint, Site *>::iterator it = siteMap.begin();
       it != siteMap.end(); ++it) {
    design->sites[index++] = it->second;
  }

  /** Tracks **/
  design->trackSz = trackGridSet.size();
  design->tracks = (Grid **)malloc(design->trackSz * sizeof(Grid *));
  index = 0;
  for (odb::dbSet<odb::dbTrackGrid>::iterator it = trackGridSet.begin();
       it != trackGridSet.end(); ++it) {
    Grid *track = (Grid *)malloc(sizeof(Grid));
    track->id = it->getId();
    track->layer = nullptr;
    if (it->getTechLayer()) {
      track->layer = layerMap[it->getTechLayer()->getId()];
    }
    std::vector<int> gridX;
    std::vector<int> gridY;
    it->getGridX(gridX);
    it->getGridY(gridY);
    track->gridXSz = gridX.size();
    track->gridYSz = gridY.size();
    track->gridX = (int *)malloc(track->gridXSz * sizeof(int));
    track->gridY = (int *)malloc(track->gridYSz * sizeof(int));
    for (size_t i = 0; i < gridX.size(); ++i) {
      track->gridX[i] = gridX[i];
    }
    for (size_t i = 0; i < gridY.size(); ++i) {
      track->gridY[i] = gridY[i];
    }

    track->gridXPatternSz = it->getNumGridPatternsX();
    track->gridYPatternSz = it->getNumGridPatternsY();
    track->gridXPatternOrigins =
        (int *)malloc(track->gridXPatternSz * sizeof(int));
    track->gridXPatternLineCounts =
        (int *)malloc(track->gridXPatternSz * sizeof(int));
    track->gridXPatternSteps =
        (int *)malloc(track->gridXPatternSz * sizeof(int));
    track->gridYPatternOrigins =
        (int *)malloc(track->gridYPatternSz * sizeof(int));
    track->gridYPatternLineCounts =
        (int *)malloc(track->gridYPatternSz * sizeof(int));
    track->gridYPatternSteps =
        (int *)malloc(track->gridYPatternSz * sizeof(int));

    int patternIndex = 0;
    for (int i = 0; i < track->gridXPatternSz; i++) {
      int origin, lineCount, step;
      it->getGridPatternX(i, origin, lineCount, step);
      track->gridXPatternOrigins[patternIndex] = origin;
      track->gridXPatternLineCounts[patternIndex] = lineCount;
      track->gridXPatternSteps[patternIndex] = step;
      patternIndex++;
    }
    patternIndex = 0;
    for (int i = 0; i < track->gridYPatternSz; i++) {
      int origin, lineCount, step;
      it->getGridPatternY(i, origin, lineCount, step);
      track->gridYPatternOrigins[patternIndex] = origin;
      track->gridYPatternLineCounts[patternIndex] = lineCount;
      track->gridYPatternSteps[patternIndex] = step;
      patternIndex++;
    }

    track->dbObject = (void *)*it;
    design->tracks[index++] = track;
  }

  /** Rows **/
  design->rowSz = rowSet.size();
  design->rows = (Row **)malloc(design->rowSz * sizeof(Row *));
  index = 0;
  for (odb::dbSet<odb::dbRow>::iterator it = rowSet.begin(); it != rowSet.end();
       ++it) {
    Row *row = (Row *)malloc(sizeof(Row));
    row->id = it->getId();
    row->name = strdup(it->getConstName());
    row->dbObject = (void *)*it;
    row->site = siteMap[it->getSite()->getId()];
    odb::dbOrientType orient = it->getOrient();
    odb::dbRowDir dir = it->getDirection();
    row->orientation = castOrientation(&orient);
    row->direction = castRowDirection(&dir);
    int x, y;
    it->getOrigin(x, y);
    row->originX = x;
    row->originY = y;
    row->spacing = it->getSpacing();
    odb::Rect boundingBox;
    it->getBBox(boundingBox);
    row->boundingBox = castRect(&boundingBox, rectId++);
    rectMap[row->boundingBox->id] = row->boundingBox;
    design->rows[index++] = row;
  }

  /** G-Cells **/
  design->gcells = nullptr;
  if (gcellGrid) {
    Grid *gcells = (Grid *)malloc(sizeof(Grid));
    gcells->id = gcellGrid->getId();
    gcells->layer = nullptr;
    std::vector<int> gridX;
    std::vector<int> gridY;
    gcellGrid->getGridX(gridX);
    gcellGrid->getGridY(gridY);
    gcells->gridXSz = gridX.size();
    gcells->gridYSz = gridY.size();
    gcells->gridX = (int *)malloc(gcells->gridXSz * sizeof(int));
    gcells->gridY = (int *)malloc(gcells->gridYSz * sizeof(int));
    for (size_t i = 0; i < gridX.size(); ++i) {
      gcells->gridX[i] = gridX[i];
    }
    for (size_t i = 0; i < gridY.size(); ++i) {
      gcells->gridY[i] = gridY[i];
    }
    gcells->gridXPatternSz = gcellGrid->getNumGridPatternsX();
    gcells->gridYPatternSz = gcellGrid->getNumGridPatternsY();
    gcells->gridXPatternOrigins =
        (int *)malloc(gcells->gridXPatternSz * sizeof(int));
    gcells->gridXPatternLineCounts =
        (int *)malloc(gcells->gridXPatternSz * sizeof(int));
    gcells->gridXPatternSteps =
        (int *)malloc(gcells->gridXPatternSz * sizeof(int));
    gcells->gridYPatternOrigins =
        (int *)malloc(gcells->gridYPatternSz * sizeof(int));
    gcells->gridYPatternLineCounts =
        (int *)malloc(gcells->gridYPatternSz * sizeof(int));
    gcells->gridYPatternSteps =
        (int *)malloc(gcells->gridYPatternSz * sizeof(int));

    int patternIndex = 0;
    for (int i = 0; i < gcells->gridXPatternSz; i++) {
      int origin, lineCount, step;
      gcellGrid->getGridPatternX(i, origin, lineCount, step);
      gcells->gridXPatternOrigins[patternIndex] = origin;
      gcells->gridXPatternLineCounts[patternIndex] = lineCount;
      gcells->gridXPatternSteps[patternIndex] = step;
      patternIndex++;
    }
    patternIndex = 0;
    for (int i = 0; i < gcells->gridYPatternSz; i++) {
      int origin, lineCount, step;
      gcellGrid->getGridPatternY(i, origin, lineCount, step);
      gcells->gridYPatternOrigins[patternIndex] = origin;
      gcells->gridYPatternLineCounts[patternIndex] = lineCount;
      gcells->gridYPatternSteps[patternIndex] = step;
      patternIndex++;
    }

    gcells->dbObject = (void *)gcellGrid;
    design->gcells = gcells;
  }

  /** Design geometry refs for **/
  design->geometrySz = geometryMap.size();
  design->geometries =
      (Geometry **)malloc(design->geometrySz * sizeof(Geometry *));
  index = 0;
  for (std::map<uint, Geometry *>::iterator it = geometryMap.begin();
       it != geometryMap.end(); ++it) {
    design->geometries[index++] = it->second;
  }

  /** Build references **/
  for (std::map<uint, Instance *>::iterator it = instanceMap.begin();
       it != instanceMap.end(); ++it) {
    Instance *inst = it->second;
    odb::dbInst *dbInst = (odb::dbInst *)inst->dbObject;
    odb::dbSet<odb::dbITerm> iterms = dbInst->getITerms();
    inst->pinSz = iterms.size();
    inst->pins = (Pin **)malloc(inst->pinSz * sizeof(Pin *));
    int pinIndex = 0;
    for (odb::dbSet<odb::dbITerm>::iterator termIt = iterms.begin();
         termIt != iterms.end(); ++termIt) {
      int termId = termIt->getId();
      if (!instancePinMap.count(termId)) {
        fprintf(stderr, "Error parsing %s\n",
                termIt->getMTerm()->getConstName());
      } else {
        inst->pins[pinIndex++] = instancePinMap[termId];
      }
    }
  }
  for (std::map<uint, Pin *>::iterator pinIt = instancePinMap.begin();
       pinIt != instancePinMap.end(); ++pinIt) {
    Pin *pin = pinIt->second;
    odb::dbITerm *dbITerm = (odb::dbITerm *)pin->dbObject;
    odb::dbInst *inst = dbITerm->getInst();
    if (inst) {
      int instId = inst->getId();
      if (!instanceMap.count(instId)) {
        fprintf(stderr, "Error parsing %s\n", inst->getConstName());
      } else {
        pin->instance = instanceMap[instId];
      }
    }
    odb::dbNet *net = dbITerm->getNet();
    if (net) {
      int netId = net->getId();
      if (netMap.count(netId)) {
        pin->net = netMap[netId];
      }
    }
  }

  for (std::map<uint, Pin *>::iterator pinIt = blockPinMap.begin();
       pinIt != blockPinMap.end(); ++pinIt) {
    Pin *pin = pinIt->second;
    odb::dbBTerm *dbBTerm = (odb::dbBTerm *)pin->dbObject;
    odb::dbNet *net = dbBTerm->getNet();
    if (net) {
      int netId = net->getId();
      if (netMap.count(netId)) {
        pin->net = netMap[netId];
      }
    }
  }

  for (std::map<uint, Net *>::iterator it = netMap.begin(); it != netMap.end();
       ++it) {
    Net *net = it->second;
    odb::dbNet *dbNet = (odb::dbNet *)net->dbObject;
    odb::dbSet<odb::dbITerm> iterms = dbNet->getITerms();
    odb::dbSet<odb::dbBTerm> bterms = dbNet->getBTerms();
    net->pinSz = iterms.size() + bterms.size();
    net->pins = (Pin **)malloc(net->pinSz * sizeof(Pin *));
    int pinIndex = 0;
    for (odb::dbSet<odb::dbITerm>::iterator termIt = iterms.begin();
         termIt != iterms.end(); ++termIt) {
      int termId = termIt->getId();
      if (!instancePinMap.count(termId)) {
        fprintf(stderr, "Error parsing %s\n",
                termIt->getMTerm()->getConstName());
      } else {
        net->pins[pinIndex++] = instancePinMap[termId];
      }
    }
    for (odb::dbSet<odb::dbBTerm>::iterator termIt = bterms.begin();
         termIt != bterms.end(); ++termIt) {
      int termId = termIt->getId();
      if (!instancePinMap.count(termId)) {
        fprintf(stderr, "Error parsing %s\n", termIt->getConstName());
      } else {
        net->pins[pinIndex++] = blockPinMap[termId];
      }
    }
  }

  for (std::map<uint, Layer *>::iterator it = layerMap.begin();
       it != layerMap.end(); ++it) {
    Layer *layer = it->second;
    odb::dbTechLayer *dbTechLayer = (odb::dbTechLayer *)layer->dbObject;
    odb::dbTechLayer *upper = dbTechLayer->getUpperLayer();
    odb::dbTechLayer *lower = dbTechLayer->getLowerLayer();
    if (upper) {
      int layerId = upper->getId();
      if (!layerMap.count(layerId)) {
        fprintf(stderr, "Error parsing %s\n", upper->getConstName());
      } else {
        layer->upperLayer = layerMap[layerId];
      }
    }
    if (lower) {
      int layerId = lower->getId();
      if (!layerMap.count(layerId)) {
        fprintf(stderr, "Error parsing %s\n", lower->getConstName());
      } else {
        layer->lowerLayer = layerMap[layerId];
      }
    }
  }

  // May add needed references to Vias here
  // for (std::map<uint, Via *>::iterator it = viaMap.begin(); it !=
  // viaMap.end();
  //      ++it) {}

  // Design area and util.
  odb::Rect dieRect;
  odb::Rect coreRect;
  odb::dbBox *blockBox = block->getBBox();
  block->getDieArea(dieRect);
  block->getCoreArea(coreRect);
  double coreArea =
      DbuToMeters(dbPtr, coreRect.dx()) * DbuToMeters(dbPtr, coreRect.dy());
  double dieArea =
      DbuToMeters(dbPtr, dieRect.dx()) * DbuToMeters(dbPtr, dieRect.dy());
  double designArea = 0.0;
  for (odb::dbInst *inst : block->getInsts()) {
    odb::dbMaster *master = inst->getMaster();
    if (master->isCoreAutoPlaceable()) {
      designArea += DbuToMeters(dbPtr, master->getWidth()) *
                    DbuToMeters(dbPtr, master->getHeight());
    }
  }
  double utilization = designArea / coreArea;
  design->coreArea = coreArea;
  design->dieArea = dieArea;
  design->designArea = designArea;
  design->utilization = utilization;
  design->boundingBox = castBox((void *)blockBox, rectId++);
  design->core = castRect((void *)&coreRect, rectId++);
  design->die = castRect((void *)&dieRect, rectId++);
  rectMap[design->boundingBox->id] = design->boundingBox;
  rectMap[design->core->id] = design->core;
  rectMap[design->die->id] = design->die;

  /** Store rect pointers for cleanup & adding layer references **/
  design->rectSz = rectMap.size();
  design->rects = (Rect **)malloc(design->rectSz * sizeof(Rect *));
  index = 0;
  for (std::map<uint, Rect *>::iterator it = rectMap.begin();
       it != rectMap.end(); ++it) {
    Rect *rect = it->second;
    if (rect->dbObject) {
      odb::dbBox *box = (odb::dbBox *)rect->dbObject;
      if (box->getTechLayer()) {
        rect->layer = layerMap[box->getTechLayer()->getId()];
      }
      if (box->getBlockVia()) {
        rect->via = viaMap[box->getBlockVia()->getId()];
      } else if (box->getTechVia()) {
        rect->via = viaMap[box->getTechVia()->getId()];
      }
    }
    design->rects[index++] = rect;
  }

  return design;
}

// dbOrientType to int
int castOrientation(void *ptr) {
  odb::dbOrientType *ori = (odb::dbOrientType *)ptr;
  if (ori->getValue() == odb::dbOrientType::Value::MX) {
    return Orientation_MX;
  } else if (ori->getValue() == odb::dbOrientType::Value::MXR90) {
    return Orientation_MX;
  } else if (ori->getValue() == odb::dbOrientType::Value::MY) {
    return Orientation_MY;
  } else if (ori->getValue() == odb::dbOrientType::Value::MYR90) {
    return Orientation_MYR90;
  } else if (ori->getValue() == odb::dbOrientType::Value::R0) {
    return Orientation_R0;
  } else if (ori->getValue() == odb::dbOrientType::Value::R180) {
    return Orientation_R180;
  } else if (ori->getValue() == odb::dbOrientType::Value::R270) {
    return Orientation_R270;
  } else if (ori->getValue() == odb::dbOrientType::Value::R90) {
    return Orientation_R90;
  }
  return Orientation_MX;
}

// dbIoType to int
int castIoType(void *ptr) {
  odb::dbIoType *typ = (odb::dbIoType *)ptr;
  if (typ->getValue() == odb::dbIoType::Value::FEEDTHRU) {
    return IOType_FEEDTHRU;
  } else if (typ->getValue() == odb::dbIoType::Value::INOUT) {
    return IOType_INOUT;
  } else if (typ->getValue() == odb::dbIoType::Value::INPUT) {
    return IOType_INPUT;
  } else if (typ->getValue() == odb::dbIoType::Value::OUTPUT) {
    return IOType_OUTPUT;
  }
  return IOType_INPUT;
}

// dbSigType to int
int castSignalType(void *ptr) {
  odb::dbSigType *typ = (odb::dbSigType *)ptr;

  if (typ->getValue() == odb::dbSigType::Value::SIGNAL) {
    return SignalType_SIGNAL;
  } else if (typ->getValue() == odb::dbSigType::Value::POWER) {
    return SignalType_POWER;
  } else if (typ->getValue() == odb::dbSigType::Value::GROUND) {
    return SignalType_GROUND;
  } else if (typ->getValue() == odb::dbSigType::Value::CLOCK) {
    return SignalType_CLOCK;
  } else if (typ->getValue() == odb::dbSigType::Value::ANALOG) {
    return SignalType_ANALOG;
  } else if (typ->getValue() == odb::dbSigType::Value::RESET) {
    return SignalType_RESET;
  } else if (typ->getValue() == odb::dbSigType::Value::SCAN) {
    return SignalType_SCAN;
  } else if (typ->getValue() == odb::dbSigType::Value::TIEOFF) {
    return SignalType_TIEOFF;
  }
  return SignalType_SIGNAL;
}
// dbMasterType to int
int castMasterType(void *ptr) {
  odb::dbMasterType *typ = (odb::dbMasterType *)ptr;
  if (typ->isBlock()) {
    return MasterType_BLOCK;
  } else if (typ->isCore()) {
    return MasterType_CORE;
  } else if (typ->isEndCap()) {
    return MasterType_ENDCAP;
  } else if (typ->isPad()) {
    return MasterType_PAD;
  }
  return MasterType_CORE;
}
// dbWireType to int
int castWireType(void *ptr) {
  odb::dbWireType *typ = (odb::dbWireType *)ptr;
  if (typ->getValue() == odb::dbWireType::Value::NONE) {
    return WireType_NONE;
  } else if (typ->getValue() == odb::dbWireType::Value::COVER) {
    return WireType_COVER;
  } else if (typ->getValue() == odb::dbWireType::Value::FIXED) {
    return WireType_FIXED;
  } else if (typ->getValue() == odb::dbWireType::Value::ROUTED) {
    return WireType_ROUTED;
  } else if (typ->getValue() == odb::dbWireType::Value::SHIELD) {
    return WireType_SHIELD;
  } else if (typ->getValue() == odb::dbWireType::Value::NOSHIELD) {
    return WireType_NOSHIELD;
  }
  return WireType_NONE;
}

// dbWireShapeType to int
int castWireShapeType(void *ptr) {
  odb::dbWireShapeType *typ = (odb::dbWireShapeType *)ptr;
  if (typ->getValue() == odb::dbWireShapeType::Value::NONE) {
    return WireShapeType_NONE;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::RING) {
    return WireShapeType_RING;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::PADRING) {
    return WireShapeType_PADRING;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::BLOCKRING) {
    return WireShapeType_BLOCKRING;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::STRIPE) {
    return WireShapeType_STRIPE;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::FOLLOWPIN) {
    return WireShapeType_FOLLOWPIN;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::IOWIRE) {
    return WireShapeType_IOWIRE;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::COREWIRE) {
    return WireShapeType_COREWIRE;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::BLOCKWIRE) {
    return WireShapeType_BLOCKWIRE;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::BLOCKAGEWIRE) {
    return WireShapeType_BLOCKAGEWIRE;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::FILLWIRE) {
    return WireShapeType_FILLWIRE;
  } else if (typ->getValue() == odb::dbWireShapeType::Value::DRCFILL) {
    return WireShapeType_DRCFILL;
  }
  return WireShapeType_NONE;
}

// dbPoint to Point
Point castPoint(void *ptr) {
  odb::Point *pt = (odb::Point *)ptr;
  Point ret;
  ret.x = pt->getX();
  ret.y = pt->getY();
  return ret;
}

// dbBox to Point
Rect *castBox(void *ptr, int id) {
  Rect *ret = (Rect *)malloc(sizeof(Rect));
  ret->id = id;
  ret->xMin = 0;
  ret->xMax = 0;
  ret->yMin = 0;
  ret->yMax = 0;
  ret->layer = nullptr;
  ret->via = nullptr;
  ret->dbObject = nullptr;
  ret->shapeType = -1;
  if (ptr != nullptr) {
    odb::dbBox *box = (odb::dbBox *)ptr;
    ret->xMin = box->xMin();
    ret->xMax = box->xMax();
    ret->yMin = box->yMin();
    ret->yMax = box->yMax();
    ret->dbObject = ptr;
  }
  return ret;
}

// dbRect to Rect
Rect *castRect(void *ptr, int id) {
  Rect *ret = (Rect *)malloc(sizeof(Rect));
  ret->id = id;
  ret->xMin = 0;
  ret->xMax = 0;
  ret->yMin = 0;
  ret->yMax = 0;
  ret->via = nullptr;
  ret->layer = nullptr;
  ret->dbObject = nullptr;
  ret->shapeType = -1;
  if (ptr != nullptr) {
    odb::Rect *dbRect = (odb::Rect *)ptr;
    ret->xMin = dbRect->xMin();
    ret->xMax = dbRect->xMax();
    ret->yMin = dbRect->yMin();
    ret->yMax = dbRect->yMax();
  }
  return ret;
}

// dbdbTechLayerType to int
int castLayerType(void *ptr) {
  odb::dbTechLayerType *typ = (odb::dbTechLayerType *)ptr;
  if (typ->getValue() == odb::dbTechLayerType::Value::ROUTING) {
    return LayerType_ROUTING;
  } else if (typ->getValue() == odb::dbTechLayerType::Value::CUT) {
    return LayerType_CUT;
  } else if (typ->getValue() == odb::dbTechLayerType::Value::MASTERSLICE) {
    return LayerType_MASTERSLICE;
  } else if (typ->getValue() == odb::dbTechLayerType::Value::OVERLAP) {
    return LayerType_OVERLAP;
  } else if (typ->getValue() == odb::dbTechLayerType::Value::IMPLANT) {
    return LayerType_IMPLANT;
  } else if (typ->getValue() == odb::dbTechLayerType::Value::NONE) {
    return LayerType_NONE;
  }
  return LayerType_NONE;
}
// dbTechLayerDir to int
int castLayerDirection(void *ptr) {
  odb::dbTechLayerDir *dir = (odb::dbTechLayerDir *)ptr;
  if (dir->getValue() == odb::dbTechLayerDir::Value::HORIZONTAL) {
    return Direction_HORIZONTAL;
  } else if (dir->getValue() == odb::dbTechLayerDir::Value::VERTICAL) {
    return Direction_VERTICAL;
  } else if (dir->getValue() == odb::dbTechLayerDir::Value::NONE) {
    return Direction_NONE;
  }
  return Direction_NONE;
}
// dbRowDir to int
int castRowDirection(void *ptr) {
  odb::dbRowDir *dir = (odb::dbRowDir *)ptr;
  if (dir->getValue() == odb::dbRowDir::Value::HORIZONTAL) {
    return Direction_HORIZONTAL;
  } else if (dir->getValue() == odb::dbRowDir::Value::VERTICAL) {
    return Direction_VERTICAL;
  }
  return Direction_NONE;
}
// dbRtEdge type to int
int castEdgeType(int type) {
  if (type == odb::dbRtEdge::Type::SEGMENT) {
    return EdgeType_SEGMENT;
  } else if (type == odb::dbRtEdge::Type::TECH_VIA) {
    return EdgeType_TECH_VIA;
  } else if (type == odb::dbRtEdge::Type::VIA) {
    return EdgeType_VIA;
  } else if (type == odb::dbRtEdge::Type::SHORT) {
    return EdgeType_SHORT;
  } else if (type == odb::dbRtEdge::Type::VWIRE) {
    return EdgeType_VWIRE;
  }
  return EdgeType_SEGMENT;
}

void FreeInstance(Instance *inst) {
  free(inst->name);
  if (inst->master) {
    free(inst->master);
  }
  free(inst->pins);
  free(inst);
}
void FreePin(Pin *pin) {
  free(pin->name);
  free(pin);
  if (pin->geometries) {
    free(pin->geometries);
  }
}
void FreeNet(Net *net) {
  free(net->name);
  free(net->pins);
  if (net->isRouted && net->edges) {
    free(net->edges);
  }
  if (net->specialBoxes) {
    free(net->specialBoxes);
  }
  free(net);
}
void FreeVia(Via *via) {
  free(via->name);
  free(via);
}
void FreeRect(Rect *rect) { free(rect); }

void FreeLayer(Layer *layer) {
  free(layer->name);
  if (layer->alias) {
    free(layer->alias);
  }
  free(layer);
}

void FreeSite(Site *site) {
  free(site->name);
  free(site);
}
void FreeRow(Row *row) {
  free(row->name);
  free(row);
}
void FreeGrid(Grid *grid) {
  if (grid->gridX) {
    free(grid->gridX);
  }
  if (grid->gridY) {
    free(grid->gridY);
  }
  if (grid->gridXPatternOrigins) {
    free(grid->gridXPatternOrigins);
  }
  if (grid->gridXPatternLineCounts) {
    free(grid->gridXPatternLineCounts);
  }
  if (grid->gridXPatternSteps) {
    free(grid->gridXPatternSteps);
  }
  if (grid->gridYPatternOrigins) {
    free(grid->gridYPatternOrigins);
  }
  if (grid->gridYPatternLineCounts) {
    free(grid->gridYPatternLineCounts);
  }
  if (grid->gridYPatternSteps) {
    free(grid->gridYPatternSteps);
  }
  free(grid);
}

void FreeGeometry(Geometry *geom) {
  if (geom->boxes) {
    free(geom->boxes);
  }
  free(geom);
}

void FreeDesign(Design *design) {
  if (design) {
    if (design->instances) {
      for (int i = 0; i < design->instanceSz; i++) {
        FreeInstance(design->instances[i]);
      }
      free(design->instances);
    }

    if (design->instancePins) {
      for (int i = 0; i < design->instancePinSz; i++) {
        FreePin(design->instancePins[i]);
      }
      free(design->instancePins);
    }
    if (design->blockPins) {
      for (int i = 0; i < design->blockPinSz; i++) {
        FreePin(design->blockPins[i]);
      }
      free(design->blockPins);
    }
    if (design->nets) {
      for (int i = 0; i < design->netSz; i++) {
        FreeNet(design->nets[i]);
      }
      free(design->nets);
    }
    if (design->viaDefinitions) {
      for (int i = 0; i < design->viaDefinitionSz; i++) {
        FreeVia(design->viaDefinitions[i]);
      }
      free(design->viaDefinitions);
    }
    if (design->routingVias) {
      for (int i = 0; i < design->routingViaSz; i++) {
        FreeVia(design->routingVias[i]);
      }
      free(design->routingVias);
    }
    if (design->layers) {
      for (int i = 0; i < design->layerSz; i++) {
        FreeLayer(design->layers[i]);
      }
      free(design->layers);
    }
    if (design->sites) {
      for (int i = 0; i < design->siteSz; i++) {
        FreeSite(design->sites[i]);
      }
      free(design->sites);
    }
    if (design->rows) {
      for (int i = 0; i < design->rowSz; i++) {
        FreeRow(design->rows[i]);
      }
      free(design->rows);
    }
    if (design->tracks) {
      for (int i = 0; i < design->trackSz; i++) {
        FreeGrid(design->tracks[i]);
      }
      free(design->tracks);
    }
    if (design->gcells) {
      FreeGrid(design->gcells);
    }
    if (design->geometries) {
      for (int i = 0; i < design->geometrySz; i++) {
        FreeGeometry(design->geometries[i]);
      }
      free(design->geometries);
    }
    if (design->rects) {
      for (int i = 0; i < design->rectSz; i++) {
        FreeRect(design->rects[i]);
      }
      free(design->rects);
    }

    free(design->name);
    free(design);
  }
}
