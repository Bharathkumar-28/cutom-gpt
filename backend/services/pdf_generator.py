from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime

def generate_pdf_report(data, file_path="sustainability_report.pdf"):
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    y = height - 40

    def draw_line(text):
        nonlocal y
        c.drawString(40, y, text)
        y -= 20

    draw_line("SUSTAINABILITY REPORT")
    draw_line("----------------------------")
    draw_line(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}")

    y -= 20
    draw_line("INPUT DETAILS")
    for k, v in data["input_summary"].items():
        draw_line(f"{k}: {v}")

    y -= 20
    draw_line("RESULTS")
    draw_line(f"CO2 Emissions (kg): {data['co2_emissions_kg']}")
    draw_line(f"Circularity Score: {data['circularity']['material_circularity_indicator']}")

    y -= 20
    draw_line("SCENARIOS")
    for name, values in data["scenarios"].items():
        draw_line(f"{name.upper()} - CO2: {values['co2']} | Circularity: {values['circularity']}")

    y -= 30
    draw_line("AI EXPLANATION")
    for line in data["ai_explanation"].split("\n"):
        draw_line(line)

    c.save()
    return file_path
