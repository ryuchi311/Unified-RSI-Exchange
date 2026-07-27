from PIL import Image
import sys

img_path = r'C:\Users\ryuch\.gemini\antigravity\brain\af569555-5bc9-4dd2-ba6a-2e6a1e6db377\.user_uploaded\media__1785155042723.jpg'
out_path = r'C:\Unified-RSI-Exchange\frontend\public\logo.png'

try:
    img = Image.open(img_path).convert('RGBA')
    data = img.getdata()
    new_data = []
    for item in data:
        # If it's very close to white, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    
    # Optional: crop the transparent edges to make it tighter
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Resize to a reasonable size for the header
    img.thumbnail((256, 256), Image.Resampling.LANCZOS)
        
    img.save(out_path, 'PNG')
    print("Success")
except Exception as e:
    print("Error:", e)
    sys.exit(1)
