import { BarChart3, Download } from "lucide-react";
import { loadRooms, getRoomCounts } from "../data/roomData";
import { useState, useMemo } from "react";

export default function Reports() {
  const [reportTime, setReportTime] = useState<"7D" | "30D" | "12M">("7D");

  const chartData = useMemo(() => {
    if (reportTime === "7D") {
      return {
        bars: [52, 68, 44, 76, 61, 88, 73],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      };
    } else if (reportTime === "30D") {
      return {
        bars: [62, 75, 82, 90],
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      };
    } else {
      return {
        bars: [45, 50, 58, 65, 70, 80, 85, 82, 88, 92, 95, 98],
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      };
    }
  }, [reportTime]);

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">REPORTS & ANALYTICS</span>
          <h1>Hotel Business Performance</h1>
          <p>Financial breakdown, occupancy trends, room vs food revenue mix.</p>
        </div>
        <button className="primary-button" onClick={() => window.print()}>
          <Download size={15} /> Export Report Summary
        </button>
      </div>

      <div className="metric-strip">
        <div>
          <span>Total Monthly Revenue</span>
          <strong>₹6.42L</strong>
        </div>
        <div>
          <span>Room Revenue</span>
          <strong>₹4.81L</strong>
        </div>
        <div>
          <span>Restaurant Dining</span>
          <strong>₹1.16L</strong>
        </div>
        <div>
          <span>Average Guest Bill</span>
          <strong>₹3,840</strong>
        </div>
      </div>

      <div className="report-grid">
        <div className="panel report-chart">
          <div className="panel-header">
            <div>
              <h2>Revenue Performance Trend</h2>
              <p>Period comparison analytics</p>
            </div>
            <div className="filter-tabs">
              {(["7D", "30D", "12M"] as const).map((r) => (
                <button
                  key={r}
                  className={reportTime === r ? "active" : ""}
                  onClick={() => setReportTime(r)}
                  style={{ height: "26px", fontSize: "10px" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="bar-chart">
            {chartData.bars.map((v, i) => (
              <div className="bar-column" key={i}>
                <div className="bar" style={{ height: `${v}%` }} />
                <span>{chartData.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel breakdown">
          <div className="panel-header">
            <div>
              <h2>Revenue Mix Share</h2>
              <p>Current operating period</p>
            </div>
            <BarChart3 size={18} />
          </div>

          <div className="breakdown-list">
            <div>
              <span>Rooms & Accommodations</span>
              <strong>75%</strong>
              <i style={{ width: "75%" }} />
            </div>
            <div>
              <span>Restaurant & Dining</span>
              <strong>18%</strong>
              <i style={{ width: "18%" }} />
            </div>
            <div>
              <span>Services & Laundry</span>
              <strong>7%</strong>
              <i style={{ width: "7%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="panel report-table">
        <div className="panel-header">
          <div>
            <h2>Operational Snapshot Indicators</h2>
            <p>Key hotel performance indicators</p>
          </div>
        </div>

        <div className="snapshot-grid">
          <div>
            <span>Average Occupancy Rate</span>
            <strong>{Math.round((getRoomCounts(loadRooms()).occupied / Math.max(1, getRoomCounts(loadRooms()).total)) * 100)}%</strong>
            <small>{getRoomCounts(loadRooms()).occupied} of {getRoomCounts(loadRooms()).total} rooms occupied</small>
          </div>
          <div>
            <span>Today's Check-ins</span>
            <strong>18 Guests</strong>
            <small>Operations normal</small>
          </div>
          <div>
            <span>Today's Check-outs</span>
            <strong>14 Guests</strong>
            <small>Billing completed</small>
          </div>
          <div>
            <span>Pending Guest Bills</span>
            <strong>3 Bills</strong>
            <small>Requires settlement</small>
          </div>
        </div>
      </div>
    </div>
  );
}
