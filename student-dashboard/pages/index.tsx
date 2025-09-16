import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ScatterChart, Scatter, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { useTable, useGlobalFilter, useSortBy, Column } from "react-table";

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

  // Radar chart data based on selected student
  const radarData = useMemo(() => {
    if (!selectedStudent) return [];
    return [
      { skill: "Comprehension", value: selectedStudent.comprehension },
      { skill: "Attention", value: selectedStudent.attention },
      { skill: "Focus", value: selectedStudent.focus },
      { skill: "Retention", value: selectedStudent.retention },
      { skill: "Assessment Score", value: selectedStudent.assessment_score },
    ];
  }, [selectedStudent]);

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Segoe UI, sans-serif", 
      background: "#f9fafb", 
      minHeight: "100vh" 
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>📊 Student Dashboard</h1>

      {overview && (
        <div style={{ 
          background: "#fff", 
          padding: "15px", 
          borderRadius: "12px", 
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)", 
          marginBottom: "20px" 
        }}>
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
          {/* Optional dropdown */}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="student-select" style={{ marginRight: "10px" }}>Select Student:</label>
            <select
              id="student-select"
              value={selectedStudent?.student_id || ""}
              onChange={(e) => {
                const student = data.find(s => s.student_id === Number(e.target.value));
                setSelectedStudent(student || null);
              }}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }}
            >
              {data.map(student => (
                <option key={student.student_id} value={student.student_id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <h2 style={{ marginTop: "30px" }}>Skills vs Assessment Score</h2>
          <div style={{ background: "#fff", padding: "10px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
            <BarChart width={700} height={300} data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="comprehension" fill="#8884d8" radius={[6,6,0,0]} />
              <Bar dataKey="attention" fill="#82ca9d" radius={[6,6,0,0]} />
              <Bar dataKey="focus" fill="#ffc658" radius={[6,6,0,0]} />
              <Bar dataKey="retention" fill="#ff8042" radius={[6,6,0,0]} />
            </BarChart>
          </div>

          <h2>Attention vs Assessment Score</h2>
          <div style={{ background: "#fff", padding: "10px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
            <ScatterChart width={700} height={300} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="attention" name="Attention" />
              <YAxis type="number" dataKey="assessment_score" name="Assessment Score" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Students" data={data} fill="#8884d8" />
            </ScatterChart>
          </div>

          <h2>Student Profile Radar Chart</h2>
          {selectedStudent && (
            <div style={{ background: "#fff", padding: "10px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", marginBottom: "20px", width: "fit-content" }}>
              <RadarChart outerRadius={100} width={400} height={300} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis />
                <Radar name={selectedStudent.name} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </div>
          )}
          <p>Click a student row in the table or use the dropdown to update their radar chart.</p>
        </>
      )}

      <input
        value={state.globalFilter || ""}
        onChange={(e) => setGlobalFilter?.(e.target.value)}
        placeholder="🔍 Search students..."
        style={{ 
          marginBottom: "15px", 
          padding: "8px 12px", 
          borderRadius: "8px", 
          border: "1px solid #ddd", 
          width: "250px" 
        }}
      />

      <table 
        {...getTableProps()} 
        style={{ 
          marginBottom: "20px", 
          borderCollapse: "collapse", 
          width: "100%", 
          background: "#fff", 
          borderRadius: "12px", 
          overflow: "hidden", 
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)" 
        }}
      >
        <thead style={{ background: "#f3f4f6" }}>
          {headerGroups.map(
            (headerGroup: any) => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: any) => (
                  <th 
                    key={column.id} 
                    {...column.getHeaderProps(column.getSortByToggleProps())} 
                    style={{ padding: "10px", textAlign: "left", cursor: "pointer" }}
                  >
                    {column.render("Header")}
                    <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                  </th>
                ))}
              </tr>
            )
          )}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row: any) => {
            prepareRow(row);
            return (
              <tr 
                key={row.id} 
                {...row.getRowProps()} 
                onClick={() => setSelectedStudent(row.original)} 
                style={{
                  cursor: "pointer",
                  transition: "0.2s",
                  borderBottom: "1px solid #eee",
                  backgroundColor: selectedStudent?.student_id === row.original.student_id ? "#e0f7fa" : "transparent"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = selectedStudent?.student_id === row.original.student_id ? "#e0f7fa" : "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedStudent?.student_id === row.original.student_id ? "#e0f7fa" : "transparent")}
              >
                {row.cells.map((cell: any) => (
                  <td key={cell.column.id} {...cell.getCellProps()} style={{ padding: "10px" }}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.length > 0 && (
        <div style={{ 
          background: "#fff", 
          padding: "15px", 
          borderRadius: "12px", 
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)" 
        }}>
          <h2>Key Insights</h2>
          <ul>
            <li>Comprehension and attention have the highest correlation with assessment score.</li>
            <li>Students with higher focus and retention also perform consistently well.</li>
            <li>Clusters can be used to identify learning personas (e.g., high-performers, low-engagement students).</li>
            <li>Click a student row or use the dropdown to visualize their skill profile in the radar chart.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
