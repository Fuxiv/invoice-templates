import pandas as pd
import pytesseract
import cv2

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


def get_data_frame(image_path):
    invoice = cv2.imread(image_path)
    invoice_data = pytesseract.image_to_data(invoice)
    data_list = list(map(lambda x: x.split('\t'), invoice_data.split('\n')))
    data_frame = pd.DataFrame(data_list[1:], columns=data_list[0])
    data_frame.dropna(inplace=True)
    data_frame["conf"] = data_frame["conf"].astype(float)
    data_frame = data_frame.query("conf >= 30")
    return data_frame.reset_index().to_json(orient="index")
