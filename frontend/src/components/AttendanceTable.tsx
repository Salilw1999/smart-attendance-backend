import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Student } from '../interfaces/types';

interface AttendanceTableProps {
  students: Student[];
}

const columns: ColumnsType<Student> = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Roll Number', dataIndex: 'rollNumber', key: 'rollNumber' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Department', dataIndex: 'department', key: 'department' },
];

const AttendanceTable: React.FC<AttendanceTableProps> = ({ students }) => {
  return (
    <div>
      <h2>Attendance Records</h2>
      <Table dataSource={students} columns={columns} rowKey="id" />
    </div>
  );
};

export default AttendanceTable;
