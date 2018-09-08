import math
import time
import random

import Adafruit_SSD1306

from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw

# Raspberry Pi pin configuration:
RST = 24
disp = Adafruit_SSD1306.SSD1306_128_64(rst=RST)
disp.begin()
width = disp.width
height = disp.height
disp.clear()
disp.display()
image = Image.new('1', (width, height))
font = ImageFont.load_default()
#font = ImageFont.truetype('',12)
draw = ImageDraw.Draw(image)

def writeText(text, line):
  draw.text((0, line), text, font=font, fill=255)

def drawBar(val):
  draw.rectangle((0,0,width,16),outline=0, fill=0)
  draw.rectangle((0,0,width*val,16),outline=0, fill=1)

def updateDisplay():
  disp.image(image)
  disp.display()


def serverStatus():
  #http://192.168.0.32:8000/status-json.xsl
  disp.display()


#text = 'LOADING...'

# Clear image buffer by drawing a black filled box.
draw.rectangle((0,0,width,height), outline=0, fill=0)

file = open("./SSID", "r")
SSID = file.read()
LISTENERS = 0

writeText("SSID: "+SSID,32)
writeText("LISTENERS: "+str(LISTENERS),48)


while 1:

  drawBar(random.random())
  updateDisplay()
  time.sleep(.001)

#disp.image(image)
#disp.display()

#writeText('LOADING...',0)
#writeText('LOADING...',4)
#writeText('LOADING...',32)
#writeText('LOADING...',)
#writeText('LOADING...',16)
#writeText('LOADING...',16)
#writeText('LOADING...',16)
updateDisplay()


