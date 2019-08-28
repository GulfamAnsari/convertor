#!/bin/sh
#  To Compress images, You need to install pngquant and jpegoptim for .png and .jpeg image optiomization

# echo "Please enter the path for unoptimized images like /home/gulfamansari/Pictures/images/";
# read INPUT_IMAGES_FILE_PATH;
INPUT_IMAGES_FILE_PATH=$@

echo "#############################################################"
echo $INPUT_IMAGES_FILE_PATH
echo "#############################################################"
# Compress the PNG files
find $INPUT_IMAGES_FILE_PATH* -exec pngquant --force --quality=40-100 --skip-if-larger --verbose \{} --output \{} \;


# Compres the jpeg files with the same modification date as original files.
# -o = overwrite
# -m50 = 50% compression rate
# -p = preserve the modification time
# -t = print total after processing the files
jpegoptim $INPUT_IMAGES_FILE_PATH* -m50 -o -p -t

# Q=find $INPUT_IMAGES_FILE_PATH -regex '.*\.\(jpg\|png\)'
# echo $Q;