#!/bin/bash

if [ $# != 0 ]; then
    echo "usage: $0"
    exit 1
fi

destdir=../../site/docroot/navicell/maps/cellcycle

#if [ -d $destdir ]; then echo "$0: TARGET_DIR $destdir already exists"; exit 1; fi

mkdir $destdir

set -e
sh ../scripts/run_factory.sh --config cellcycle_src/config --xrefs xrefs.txt --destination $destdir --verbose --demo $*

cd $destdir
url=$(pwd)/master/index.html

echo
echo Cell Cycle map has been succesfully generated
echo
echo "Available at URL file://${url}"
echo
echo "If you are using Chrome, open it using --allow-file-access-from-files option"
echo
echo "Under Linux"
echo "google-chrome --allow-file-access-from-files"
echo
echo "Under MacOS"
echo 'open -a "Google Chrome" --args --allow-file-access-from-files'
