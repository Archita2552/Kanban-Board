import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState('By Status'); // default grouping is by status
  const [sortBy, setSortBy] = useState('priority');

  // Fetch tickets and users data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketResponse = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        setTickets(ticketResponse.data.tickets);
        setUsers(ticketResponse.data.users);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  // Save and load groupBy and sortBy to/from localStorage
  useEffect(() => {
    const savedGroupBy = localStorage.getItem('groupBy');
    const savedSortBy = localStorage.getItem('sortBy');
    
    if (savedGroupBy) setGroupBy(savedGroupBy);
    if (savedSortBy) setSortBy(savedSortBy);
  }, []);

  useEffect(() => {
    localStorage.setItem('groupBy', groupBy);
    localStorage.setItem('sortBy', sortBy);
  }, [groupBy, sortBy]);

  // Group tickets by status, user, or priority
  const groupTickets = (tickets, groupingOption) => {
    let grouped = {};
  
    if (groupingOption === 'By Status') {
      grouped = tickets.reduce((acc, ticket) => {
        if (!acc[ticket.status]) {
          acc[ticket.status] = [];
        }
        acc[ticket.status].push(ticket);
        return acc;
      }, {});
    }
  
    if (groupingOption === 'By User') {
      grouped = tickets.reduce((acc, ticket) => {
        const user = users.find((user) => user.id === ticket.userId);
        const userName = user ? user.name : 'Unknown User';
  
        if (!acc[userName]) {
          acc[userName] = [];
        }
        acc[userName].push(ticket);
        return acc;
      }, {});
    }
  
    if (groupingOption === 'By Priority') {
      grouped = tickets.reduce((acc, ticket) => {
        const priority = ticket.priority;
        if (!acc[priority]) {
          acc[priority] = [];
        }
        acc[priority].push(ticket);
        return acc;
      }, {});
    }
  
    return grouped;
  };

  // Sort tickets by priority or title
  const sortTickets = (ticketsToSort, sortBy) => {
    return ticketsToSort.sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  // Priority levels mapping
  const priorityLabels = {
    4: 'Urgent',
    3: 'High',
    2: 'Medium',
    1: 'Low',
    0: 'No priority',
  };

  const getPriorityLabel = (priority) => priorityLabels[priority] || 'No priority';

  // Group tickets based on the groupBy state
  const groupedTickets = groupTickets(tickets, groupBy);

  return (
    <div className="kanban-board">
      <div className="controls">
        <button onClick={() => setGroupBy('By Status')}>Group by Status</button>
        <button onClick={() => setGroupBy('By User')}>Group by User</button>
        <button onClick={() => setGroupBy('By Priority')}>Group by Priority</button>
        <button onClick={() => setSortBy('priority')}>Sort by Priority</button>
        <button onClick={() => setSortBy('title')}>Sort by Title</button>
      </div>

      <div className="kanban-columns">
        {Object.keys(groupedTickets).map(group => (
          <div key={group} className="kanban-column">
            <h2>{group}</h2>
            {sortTickets(groupedTickets[group], sortBy).map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <h3>{ticket.title}</h3>
                <p>ID: {ticket.id}</p>
                <p>Priority: {getPriorityLabel(ticket.priority)}</p>
                <p>Status: {ticket.status}</p>
                <p>Tags: {ticket.tag.join(', ')}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
