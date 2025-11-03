import os
from openpyxl import Workbook
from datetime import datetime
from typing import List, Dict

EXPORT_DIR = "exports"
os.makedirs(EXPORT_DIR, exist_ok=True)  # ensure export directory exists

def export_attendance_to_excel(attendance_data: List[Dict], file_name: str) -> str:
    """
    Exports attendance data to an Excel file.
    
    Automatically creates 'exports/' directory and saves timestamped file.

    Parameters:
        attendance_data (List[Dict]): Attendance records as list of dicts.
        file_name (str): Base file name.

    Returns:
        str: Path to saved Excel file.
    """
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Attendance Records"

    if not attendance_data:
        # No data case
        sheet.append(["No attendance records available"])
        file_path = os.path.join(EXPORT_DIR, f"{file_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
        workbook.save(file_path)
        return file_path

    # ✅ Dynamically extract headers from the first record
    headers = list(attendance_data[0].keys())
    sheet.append(headers)

    # ✅ Append all rows
    for record in attendance_data:
        row = [record.get(header, "") for header in headers]
        sheet.append(row)

    # ✅ Save workbook to /exports folder
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(EXPORT_DIR, f"{file_name}_{timestamp}.xlsx")
    workbook.save(file_path)

    return file_path
