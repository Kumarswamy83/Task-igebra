import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ScatterChart, Scatter, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { useTable, useGlobalFilter, useSortBy, Column } from "react-table";

// Student interface
interface Student {
  student_id: number;
  name: string;
  class: string;
  comprehension: number;
  attention: number;
  focus: number;
  retention: number;
  assessment_score: number;
  engagement_time: number;
}

export default function Home() {
  const [data, setData] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetch("/processed_students.json")
      .then(res => res.json())
      .then(json => {
        setData(json.students);
        if (json.students.length > 0) setSelectedStudent(json.students[0]);
      });
  }, []);

  const overview = useMemo(() => {
    if (data.length === 0) return null;
    const total = data.length;
    const avgScore = (data.reduce((sum, s) => sum + s.assessment_score, 0) / total).toFixed(2);
    const avgComprehension = (data.reduce((sum, s) => sum + s.comprehension, 0) / total).toFixed(2);
    const avgAttention = (data.reduce((sum, s) => sum + s.attention, 0) / total).toFixed(2);
    const avgFocus = (data.reduce((sum, s) => sum + s.focus, 0) / total).toFixed(2);
    const avgRetention = (data.reduce((sum, s) => sum + s.retention, 0) / total).toFixed(2);
    return { total, avgScore, avgComprehension, avgAttention, avgFocus, avgRetention };
  }, [data]);

  const columns: Column<Student>[] = useMemo(() => [
    { Header: "Name", accessor: "name" as const },
    { Header: "Class", accessor: "class" as const },
    { Header: "Comprehension", accessor: "comprehension" as const },
    { Header: "Attention", accessor: "attention" as const },
    { Header: "Focus", accessor: "focus" as const },
    { Header: "Retention", accessor: "retention" as const },
    { Header: "Score", accessor: "assessment_score" as const },
  ], []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableInstance: any = useTable({ columns, data }, useGlobalFilter, useSortBy);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, setGlobalFilter, state } = tableInstance;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Student Dashboard</h1>

      {overview && (
        <div style={{ marginBottom: "20px" }}>
          <p><strong>Total Students:</strong> {overview.total}</p>
          <p><strong>Average Score:</strong> {overview.avgScore}</p>
          <p>
            <strong>Avg Comprehension:</strong> {overview.avgComprehension}, 
            <strong> Attention:</strong> {overview.avgAttention}, 
            <strong> Focus:</strong> {overview.avgFocus}, 
            <strong> Retention:</strong> {overview.avgRetention}
          </p>
        </div>
      )}

      {data.length > 0 && (
        <>
          <h2>Skills vs Assessment Score</h2>
          <BarChart width={700} height={300} data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="comprehension" fill="#8884d8" />
            <Bar dataKey="attention" fill="#82ca9d" />
            <Bar dataKey="focus" fill="#ffc658" />
            <Bar dataKey="retention" fill="#ff8042" />
          </BarChart>

          <h2>Attention vs Assessment Score</h2>
          <ScatterChart width={700} height={300} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="attention" name="Attention" />
            <YAxis type="number" dataKey="assessment_score" name="Assessment Score" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Students" data={data} fill="#8884d8" />
          </ScatterChart>

          <h2>Student Profile Radar Chart</h2>
          {selectedStudent && (
            <RadarChart outerRadius={100} width={400} height={300} data={[
              { skill: "Comprehension", value: selectedStudent.comprehension },
              { skill: "Attention", value: selectedStudent.attention },
              { skill: "Focus", value: selectedStudent.focus },
              { skill: "Retention", value: selectedStudent.retention },
              { skill: "Assessment Score", value: selectedStudent.assessment_score },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis />
              <Radar name={selectedStudent.name} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          )}
          <p>Click a student row in the table to update their radar chart.</p>
        </>
      )}

      <input
        value={state.globalFilter || ""}
        onChange={(e) => setGlobalFilter?.(e.target.value)}
        placeholder="Search students..."
        style={{ marginBottom: "10px", padding: "5px", width: "200px" }}
      />

      <table {...getTableProps()} border={1} cellPadding={5} style={{ marginBottom: "20px", borderCollapse: "collapse" }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <thead>
          {headerGroups.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (headerGroup: any) => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (column: any) => (
                    <th key={column.id} {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render("Header")}
                      <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                    </th>
                  )
                )}
              </tr>
            )
          )}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (row: any) => {
              prepareRow(row);
              return (
                <tr key={row.id} {...row.getRowProps()} onClick={() => setSelectedStudent(row.original)} style={{ cursor: "pointer" }}>
                  {row.cells.map(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (cell: any) => (
                      <td key={cell.column.id} {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    )
                  )}
                </tr>
              );
            }
          )}
        </tbody>
      </table>

      {data.length > 0 && (
        <div>
          <h2>Key Insights</h2>
          <ul>
            <li>Comprehension and attention have the highest correlation with assessment score.</li>
            <li>Students with higher focus and retention also perform consistently well.</li>
            <li>Clusters can be used to identify learning personas (e.g., high-performers, low-engagement students).</li>
            <li>Click a student row to visualize their skill profile in the radar chart.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
