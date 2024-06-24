import re
import cv2
import pytesseract
import pandas as pd
import json

# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

with open("app/static/config.json", 'r') as file:
    config = json.load(file)

with open("app/static/templates.json", 'r') as file:
    templates = json.load(file)


def data_frame_prep(invoice_path):
    invoice = cv2.imread(invoice_path)
    invoice_data = pytesseract.image_to_data(invoice)
    data_list = list(map(lambda x: x.split('\t'), invoice_data.split('\n')))
    data_frame = pd.DataFrame(data_list[1:], columns=data_list[0])
    data_frame.dropna(inplace=True)
    data_frame["conf"] = data_frame["conf"].astype(float)
    data_frame = data_frame.query("conf >= 30")
    data_frame = data_frame.reset_index()
    return data_frame


def read_with_template(template, df):
    output = dict()
    for index, row in df.iterrows():
        row["left"], row["top"], row["width"], row["height"] = int(row["left"]), int(row["top"]), int(
            row["width"]), int(row["height"])
        coord_x = row["left"] + (row["width"] / 2)
        coord_y = row["top"] + (row["height"] / 2)
        # get labels
        for label in template["labels"]:
            label_x = label["left"] + (label["width"] / 2)
            label_y = label["top"] + (label["height"] / 2)
            if label_x - 3 < coord_x < label_x + 3 and label_y - 3 < coord_y < label_y + 3:
                if label["regex"] != "none":
                    current_regex = {}
                    for y in range(len(config["regex"])):
                        if config["regex"][y]["name"] == label["regex"]:
                            current_regex = config["regex"][y]
                            break
                    if current_regex["name"] not in output.keys():
                        output[current_regex["name"]] = []
                        output[current_regex["name"]].append(re.search(current_regex["retrieve"], row["text"]).group())
                    else:
                        output[current_regex["name"]].append(re.search(current_regex["retrieve"], row["text"]).group())
                    break

                if label["field_name"] not in output.keys():
                    output[label["field_name"]] = []
                    output[label["field_name"]].append(row["text"])
                else:
                    output[label["field_name"]].append(row["text"])
                break
        # get boxes
        for box in template["boxes"]:
            if box["left"] < coord_x < box["right"] and box["top"] < coord_y < box["bottom"]:
                if box["field_name"] not in output.keys():
                    output[box["field_name"]] = []
                    output[box["field_name"]].append(row["text"])
                else:
                    output[box["field_name"]].append(row["text"])
    return output


def read_with_template_box_regex(template, df):
    output = dict()
    for box in template["boxes"]:
        box_text = ''
        if box["regex"] != "none":
            current_regex = {}
            for y in range(len(config["regex"])):
                if config["regex"][y]["name"] == box["regex"]:
                    current_regex = config["regex"][y]
                    break
            if current_regex:
                for index, row in df.iterrows():
                    row["left"], row["top"], row["width"], row["height"] = int(row["left"]), int(row["top"]), int(
                        row["width"]), int(row["height"])
                    coord_x = row["left"] + (row["width"] / 2)
                    coord_y = row["top"] + (row["height"] / 2)
                    if box["left"] < coord_x < box["right"] and box["top"] < coord_y < box["bottom"]:
                        box_text += row["text"] + ' '
                box_text = re.match(current_regex["regex"], box_text).group()

                if current_regex["name"] not in output.keys():
                    output[current_regex["name"]] = []
                    output[current_regex["name"]].append(re.search(current_regex["retrieve"], box_text).group())
                else:
                    output[current_regex["name"]].append(re.search(current_regex["retrieve"], box_text).group())
    return output


def find_matching_templates(df):
    matching_templates = []
    for temp in templates:
        if read_with_template(temp, df):
            matching_templates.append(temp["tempName"])
    return matching_templates
