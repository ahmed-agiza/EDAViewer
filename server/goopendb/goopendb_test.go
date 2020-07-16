package goopendb

import (
	"testing"
)

func TestParseLEFDEF(t *testing.T) {
	defPath := "../example/Nangate45/gcd.def"
	lefPath := "../example/Nangate45/NangateOpenCellLibrary.mod.lef"

	var db OpenDB
	db, err := NewDatabase()
	if err != nil {
		t.Fatal(err)
		return
	}
	defer db.FreeDatabase()
	err = db.ParseLEF(lefPath)
	if err != nil {
		t.Fatal(err)
	}
	err = db.ParseDEF(defPath)
	if err != nil {
		t.Fatal(err)
	}
	design, err := db.GetDesign()
	if err != nil {
		t.Fatal(err)
	}

	if design.Name != "gcd" {
		t.Fatal("Unexpected design name", design.Name)
	}

	expected := map[string]int{
		"Instances":      182,
		"Nets":           268,
		"InstancePins":   1164,
		"BlockPins":      56,
		"RoutingVias":    7,
		"ViaDefinitions": 7,
		"Layers":         22,
		"Rows":           15,
		"Tracks":         10,
		"Sites":          1,
	}
	actual := map[string]int{
		"Instances":      len(design.Instances),
		"Nets":           len(design.Nets),
		"InstancePins":   len(design.InstancePins),
		"BlockPins":      len(design.BlockPins),
		"RoutingVias":    len(design.RoutingVias),
		"ViaDefinitions": len(design.ViaDefinitions),
		"Layers":         len(design.Layers),
		"Rows":           len(design.Rows),
		"Tracks":         len(design.Tracks),
		"Sites":          len(design.Sites),
	}

	if design.Name != "gcd" {
		t.Fatal("Unexpected design name", design.Name)
	}
	for k, v := range expected {
		if actual[k] != v {
			t.Errorf("Expected length of %v to be %v, found %v", k, v, actual[k])
		}
	}
}
