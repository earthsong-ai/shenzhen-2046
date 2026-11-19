"""Print display-referred BT.709 luma and RMS contrast for the film aperture."""
from argparse import ArgumentParser
from pathlib import Path
from math import sqrt
from PIL import Image

TIMES = (0.5, 4.5, 6.1, 8, 10, 17.5, 21.5, 26.5, 29.5, 34.5, 38.6, 46)


def aperture(image):
    w, h = image.size
    cw, ch = min(w, round(2.38*h)), min(h, round(w/2.38))
    x, y = (w-cw)//2, (h-ch)//2
    return image.crop((x, y, x+cw, y+ch))


def luma_stats(image):
    hist = image.convert('RGB').convert('L', (0.2126, 0.7152, 0.0722, 0)).histogram()
    count = sum(hist)
    avg = sum(i*n for i, n in enumerate(hist))/count
    contrast = sqrt(sum(n*(i-avg)**2 for i, n in enumerate(hist))/count)
    return avg, contrast


if __name__ == '__main__':
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path)
    parser.add_argument('--skyline', action='store_true', help='fixed middle-distance skyline ROI')
    parser.add_argument('--times', nargs='+', type=float, default=TIMES, help='film times in seconds')
    args = parser.parse_args()
    print('秒,平均亮度,对比度')
    for t in args.times:
        with Image.open(args.directory / f'{t:g}.png') as frame:
            image = aperture(frame)
            if args.skyline:
                w, h = image.size
                image = image.crop((round(.16*w),round(.40*h),round(.69*w),round(.68*h)))
            avg, contrast = luma_stats(image)
            print(f'{t:g},{avg:.2f},{contrast:.2f}')
