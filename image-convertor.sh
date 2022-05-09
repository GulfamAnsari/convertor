#!/bin/sh
#  To Compress images, You need to install pngquant and jpegoptim for .png and .jpeg image optiomization

INPUT_IMAGES_FILE_PATH=$@

echo "#############################################################"
echo $INPUT_IMAGES_FILE_PATH
echo "#############################################################"

# Convert all images to .png
mogrify -format jpg $INPUT_IMAGES_FILE_PATH'*.png' # Error if there is no  PNG file in the folder

# remove all png
sudo rm -rf -d $INPUT_IMAGES_FILE_PATH*.png

# Resize 100-90%
mogrify -resize 90% $INPUT_IMAGES_FILE_PATH'*.jpg'

# Compress the PNG files
find $INPUT_IMAGES_FILE_PATH -regex '.*\.\(PNG\|png\)' -exec pngquant --force --quality=30-60 --skip-if-larger --verbose \{} --output \{} \;


# Compres the jpeg files with the same modification date as original files.
# -o = overwrite
# -m80 = 80% compression rate
# -p = preserve the modification time
# -t = print total after processing the files
jpegoptim $INPUT_IMAGES_FILE_PATH* -m80 -o -p -t

# cleanup
sudo rm -rf $INPUT_IMAGES_FILE_PATH/demo.jpg