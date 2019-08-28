#!/bin/sh
#  To Compress images, You need to install pngquant and jpegoptim for .png and .jpeg image optiomization

# echo "Please enter the path for unoptimized images like /home/gulfamansari/Pictures/images/";
# read INPUT_IMAGES_FILE_PATH;
INPUT_IMAGES_FILE_PATH=$@

echo "#############################################################"
echo $INPUT_IMAGES_FILE_PATH
echo "#############################################################"

# Convert all images to .png
mogrify -format jpg $INPUT_IMAGES_FILE_PATH'*.png'

# remove all png
sudo rm -rf -d $INPUT_IMAGES_FILE_PATH*.png

# Resize 50%
mogrify -resize 50% $INPUT_IMAGES_FILE_PATH'*.jpg'

# Compress the PNG files
find $INPUT_IMAGES_FILE_PATH -regex '.*\.\(PNG\|png\)' -exec pngquant --force --quality=30-60 --skip-if-larger --verbose \{} --output \{} \;


# Compres the jpeg files with the same modification date as original files.
# -o = overwrite
# -m50 = 50% compression rate
# -p = preserve the modification time
# -t = print total after processing the files
jpegoptim $INPUT_IMAGES_FILE_PATH* -m35 -o -p -t
