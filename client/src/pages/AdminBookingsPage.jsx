import React, { useState, useEffect, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender 
} from '@tanstack/react-table';
import './AdminBookingsPage.css'; // We will create this CSS file next


const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [globalFilter, setGlobalFilter] = useState(''); // For the search bar
  const [sorting, setSorting] = useState([]); // For sorting columns

  // Fetch the booking data from our secure endpoint
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found.');
        setIsLoading(false);
        return;
      }

      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin/bookings`;
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings. You may not be authorized.');
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Define the columns for our table
  const columns = useMemo(() => [
    {
      accessorKey: 'order.user.name',
      header: 'Customer',
    },
    {
      accessorKey: 'startTime',
      header: 'Session Date',
      cell: info => new Date(info.getValue()).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'coach.user.name',
      header: 'Coach',
    },
  ], []);

  // useReactTable hook to create the table instance
  const table = useReactTable({
    data: bookings,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <p>Loading bookings...</p>;
  if (error) return <p style={{ color: '#f39f5a' }}>Error: {error}</p>;

  return (
    <div className="admin-table-container">
      <h2>Bookings Management</h2>
      <div className="table-controls">
        <input
          type="text"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search all columns..."
          className="table-search-input"
        />
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-controls">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          « Previous
        </button>
        <span>
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </strong>
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next »
        </button>
      </div>
    </div>
  );
};

export default AdminBookingsPage;