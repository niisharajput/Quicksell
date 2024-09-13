import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import displayIcon from './Display.svg'; 
import highPriorityIcon from './Urgent Priority colour.svg'; 
import mediumPriorityIcon from './Medium Priority.svg';
import lowPriorityIcon from './Low Priority.svg'; 
import noPriorityIcon from './No Priority.svg'; 
import progressIcon from './progress.svg'; 
import backlogIcon from './Backlog.svg'; 
import todoIcon from './To-do.svg';
import checkmarkIcon from './Done.svg'; 

const FilterOptions = ({ groupBy, setGroupBy, sortBy, setSortBy, showFilters, toggleFilters }) => (
  <div className="filter-container">
    <button className="display-button" onClick={toggleFilters}>
      <span className="icon"><img src={displayIcon} alt="Display" /></span> Display
    </button>
    {showFilters && (
      <div className="filter-options">
        <div className="filter-group">
          <label htmlFor="grouping">Grouping</label>
          <select id="grouping" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="user">User</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sorting">Ordering</label>
          <select id="sorting" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
    )}
  </div>
);

const TicketCard = ({ ticket }) => {
  const [isSelected, setIsSelected] = useState(false); 

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 1:
        return highPriorityIcon;
      case 2:
        return mediumPriorityIcon;
      case 3:
        return lowPriorityIcon;
      default:
        return noPriorityIcon; 
    }
  };

  const toggleSelection = () => {
    setIsSelected(!isSelected);
  };

  return (
    <div className="card" key={ticket.id}>
      <div className="card-header">
        <div className="card-id">{ticket.id}</div>
      </div>
      <div className="card-title">
        <button
          className={`select-button ${isSelected ? "selected" : ""}`}
          onClick={toggleSelection}
        >
          {isSelected ? <img src={checkmarkIcon} alt="Selected" /> : ""}
        </button>
        {ticket.title}
      </div>
      <div className="card-details">
        <div className="tag-container">
          <span className="icon">
            <img src={getPriorityIcon(ticket.priority)} alt="Priority Icon" className="priority-icon" />
          </span>        
        </div>
        <div className="tag-list">
          {ticket.tag.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const TicketColumn = ({ group, tickets, groupBy }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 1:
        return highPriorityIcon;
      case 2:
        return mediumPriorityIcon;
      case 3:
        return lowPriorityIcon;
      default:
        return noPriorityIcon;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return progressIcon;
      case 'backlog':
        return backlogIcon;
      case 'todo':
        return todoIcon;
      default:
        return null;
    }
  };

  return (
    <div className={`column ${group.className}`} key={group.key}>
      <div className="column-header">
        {groupBy === "priority" && (
          <img
            src={getPriorityIcon(group.key)}
            alt={`${group.name} Priority Icon`}
            className="priority-icon"
          />
        )}
        {groupBy === "status" && (
          <img
            src={getStatusIcon(group.name)}
            alt={`${group.name} Status Icon`}
            className="status-icon" 
          />
        )}
        <div className="column-name">{group.name}</div>
        <div className="count">{group.count}</div>
      </div>
      <div className="cards">
        {tickets.map(ticket => <TicketCard ticket={ticket} key={ticket.id} />)}
      </div>
    </div>
  );
};

function App() {
  const [showFilters, setShowFilters] = useState(false);
  const [groupBy, setGroupBy] = useState(localStorage.getItem("groupBy") || "status");
  const [sortBy, setSortBy] = useState(localStorage.getItem("sortBy") || "priority");
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.quicksell.co/v1/internal/frontend-assignment");
        const result = await response.json();
        setTickets(result.tickets);
        setUsers(result.users);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      }
    };
    fetchData();
  }, []);

  
  useEffect(() => {
    localStorage.setItem("groupBy", groupBy);
  }, [groupBy]);

  useEffect(() => {
    localStorage.setItem("sortBy", sortBy);
  }, [sortBy]);

  const groupedSortedTickets = useMemo(() => {
    if (!tickets) return [];
    let groupedTickets = [...tickets];

    if (groupBy === "priority") {
      groupedTickets = groupedTickets.sort((a, b) => a.priority - b.priority);
    } else if (groupBy === "user") {
      groupedTickets = groupedTickets.sort((a, b) => a.userId - b.userId);
    } else if (groupBy === "status") {
      groupedTickets = groupedTickets.sort((a, b) => a.status.localeCompare(b.status));
    }

    if (sortBy === "priority") {
      groupedTickets = groupedTickets.sort((a, b) => a.priority - b.priority);
    } else if (sortBy === "title") {
      groupedTickets = groupedTickets.sort((a, b) => a.title.localeCompare(b.title));
    }

    return groupedTickets;
  }, [tickets, groupBy, sortBy]);

  const groupedData = useMemo(() => {
    if (groupBy === "priority") {
      return [0, 1, 2, 3, 4].map(priorityLevel => ({
        key: priorityLevel,
        name: getPriorityName(priorityLevel),
        count: groupedSortedTickets.filter(ticket => ticket.priority === priorityLevel).length,
        tickets: groupedSortedTickets.filter(ticket => ticket.priority === priorityLevel)
      }));
    } else if (groupBy === "user") {
      return users.map(user => ({
        key: user.id,
        name: user.name,
        count: groupedSortedTickets.filter(ticket => ticket.userId === user.id).length,
        tickets: groupedSortedTickets.filter(ticket => ticket.userId === user.id)
      }));
    } else if (groupBy === "status") {
      const statuses = Array.from(new Set(tickets.map(ticket => ticket.status)));
      return statuses.map(status => ({
        key: status,
        name: status,
        count: groupedSortedTickets.filter(ticket => ticket.status === status).length,
        tickets: groupedSortedTickets.filter(ticket => ticket.status === status)
      }));
    }
    return [];
  }, [groupBy, groupedSortedTickets, tickets, users]);

  return (
    <div className="container">
      <div className="header">
        <FilterOptions
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
        />
      </div>
      <div className="board">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          groupedData.map(group => (
            <TicketColumn
              group={group}
              tickets={group.tickets}
              key={group.key}
              groupBy={groupBy}  
            />
          ))
        )}
      </div>
    </div>
  );
}

const getPriorityName = (priority) => {
  switch (priority) {
    case 0:
      return "No priority";
    case 1:
      return "Urgent";
    case 2:
      return "High";
    case 3:
      return "Medium";
    case 4:
      return "Low";
    default:
      return "";
  }
};

export default App;
