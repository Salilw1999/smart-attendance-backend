from openpyxl import Workbook
from datetime import datetime
from typing import List, Dict


def export_attendance_to_excel(attendance_data: List[Dict], file_name: str) -> str:
    """
    Exports attendance data to an Excel file.

    Parameters:
    attendance_data (List[Dict]): A list of dictionaries containing attendance records.
    file_name (str): The name of the file to save the Excel sheet as.

    Returns:
    str: The path to the saved Excel file.
    """
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Attendance Records"

    # Define the header
    headers = ["Student ID", "Student Name", "Date", "Status"]
    sheet.append(headers)

    # Add attendance data
    for record in attendance_data:
        # Format date if it's a datetime
        date_val = record.get('date')
        if hasattr(date_val, 'strftime'):
            date_val = date_val.strftime('%Y-%m-%d %H:%M:%S')
        sheet.append([record.get('student_id'), record.get('student_name'), date_val, record.get('status')])

    # Save the workbook
    file_path = f"{file_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    workbook.save(file_path)

    return file_path
