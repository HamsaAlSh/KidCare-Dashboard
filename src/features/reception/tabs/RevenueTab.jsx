import React, { useMemo } from 'react';
import { DollarSign, CreditCard, BarChart3 } from 'lucide-react';
import { appointments } from '../data/appointments';

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function RevenueTab() {
  const paid = appointments.filter(a => a.paid);
  const total = paid.reduce((s, a) => s + a.amount, 0);
  const avg = paid.length ? Math.round(total / paid.length) : 0;

  const hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16'];
  const hourData = useMemo(() => hours.map(h => 
    appointments.filter(a => a.paid && a.time.startsWith(h)).reduce((s, a) => s + a.amount, 0)
  ), []);
  const maxVal = Math.max(...hourData, 1);

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard icon={DollarSign} iconColor="#22c55e" value={`$${total.toLocaleString()}`} label="Total Revenue" />
        <StatCard icon={CreditCard} iconColor="#6366f1" value={paid.length} label="Paid Transactions" />
        <StatCard icon={BarChart3} iconColor="#a855f7" value={`$${avg.toLocaleString()}`} label="Average Payment" />
      </div>

      <div className="content-grid">
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Revenue by Hour</h3>
          </div>
          <div className="chart-container">
            {hourData.map((val, i) => {
              const height = (val / maxVal) * 100;
              const opacity = 0.3 + (val / maxVal) * 0.7;
              return (
                <div key={hours[i]} className="chart-bar" style={{ height: `${height}%`, background: `rgba(99,102,241,${opacity})` }}>
                  {val > 0 && <div className="chart-bar-value">${val}</div>}
                  <div className="chart-bar-label">{hours[i]}:00</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Payment Details</h3>
          </div>
          <div className="revenue-list">
            {paid.map(a => (
              <div key={a.id} className="revenue-item">
                <div className="revenue-info">
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{getInitials(a.patient)}</div>
                  <div className="patient-info">
                    <div className="patient-name">{a.patient}</div>
                    <div className="patient-phone">{a.doctor} · {a.time}</div>
                  </div>
                </div>
                <div className="revenue-amount">+${a.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${iconColor}26` }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}