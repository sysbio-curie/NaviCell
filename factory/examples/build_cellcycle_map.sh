destdir=../../site/docroot/navicell/maps/cellcycle

if [ -d $destdir ]; then echo "$0: TARGET_DIR $destdir already exists"; exit 1; fi

mkdir $destdir

sh ../scripts/run_factory.sh --config cellcycle_src/config --xrefs xrefs.txt --destination $destdir --verbose
