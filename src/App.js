import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

let nextFriendId = 1;
let nextItemId = 1;

function App() {
  const [friends, setFriends] = useState([]); // [{id, name}]
  const [foodItems, setFoodItems] = useState([]); // [{id, name, price, sharedFriendIds, inclusive}]
  const [drinkItems, setDrinkItems] = useState([]);
  const [bills, setBills] = useState({}); // name -> total
  const [breakdown, setBreakdown] = useState({}); // name -> [{item, base, tax, tip, treatDelta}]
  const [taxCGST, setTaxCGST] = useState(2.55);
  const [taxSGST, setTaxSGST] = useState(2.5);
  const [treats, setTreats] = useState([]);
  const [tip, setTip] = useState(0);
  const [expandedFriend, setExpandedFriend] = useState(null);
  const [dragInfo, setDragInfo] = useState(null); // {fromType, itemId}

  const [newFriendName, setNewFriendName] = useState('');
  const [editingFriendId, setEditingFriendId] = useState(null);
  const [editingFriendName, setEditingFriendName] = useState('');

  const [newFoodItemName, setNewFoodItemName] = useState('');
  const [newFoodItemPrice, setNewFoodItemPrice] = useState('');
  const [newDrinkItemName, setNewDrinkItemName] = useState('');
  const [newDrinkItemPrice, setNewDrinkItemPrice] = useState('');

  const friendInputRef = useRef(null);
  const foodNameRef = useRef(null);
  const drinkNameRef = useRef(null);

  // ---------- PDF Download ----------

  const downloadPDF = async () => {
    if (Object.keys(bills).length === 0) {
      alert('Please calculate the bill first!');
      return;
    }

    // Create a temporary div with the bill content
    const billContent = document.createElement('div');
    billContent.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 800px;
      background: white;
      padding: 30px;
      font-family: Arial, sans-serif;
    `;

    // Build the HTML content
    let html = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #050509; margin: 0; font-size: 28px;">Baap Ka Paisa</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 13px;">Smart, item-wise bill splitter</p>
      </div>

      <div style="margin-bottom: 25px; padding: 15px; background: #f4c25920; border-radius: 8px; border: 1px solid #f4c259;">
        <h2 style="color: #050509; margin: 0 0 15px 0; font-size: 16px;">📜 Bill Summary</h2>
    `;

    // Add friends and their totals
    Object.keys(bills).forEach(name => {
      const amount = bills[name].toFixed(2);
      html += `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px;">
          <span style="color: #333; font-weight: 500;">${name}</span>
          <span style="color: #050509; font-weight: 700;">₹${amount}</span>
        </div>
      `;
    });

    // Add total
    const grandTotal = Object.values(bills)
      .reduce((sum, val) => sum + val, 0)
      .toFixed(2);

    html += `
        <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 8px; font-size: 15px; border-top: 2px solid #f4c259; color: #050509; font-weight: 700;">
          <span>Grand Total</span>
          <span>₹${grandTotal}</span>
        </div>
      </div>
    `;

    // Add items breakdown
    const allItems = [
      ...foodItems.map(it => ({ ...it, type: 'Food' })),
      ...drinkItems.map(it => ({ ...it, type: 'Drink' })),
    ];

    if (allItems.length > 0) {
      html += `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #050509; margin: 0 0 12px 0; font-size: 16px;">🍽️ Items Breakdown</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f4c25933; border-bottom: 2px solid #f4c259;">
                <th style="text-align: left; padding: 8px; color: #050509; font-weight: 700;">Item</th>
                <th style="text-align: center; padding: 8px; color: #050509; font-weight: 700;">Price</th>
                <th style="text-align: left; padding: 8px; color: #050509; font-weight: 700;">Shared By</th>
              </tr>
            </thead>
            <tbody>
      `;

      allItems.forEach(item => {
        const sharedNames = item.sharedFriendIds
          .map(id => friendNameById(id))
          .join(', ');
        html += `
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 8px; color: #333;">${item.type}: ${item.name}</td>
                <td style="text-align: center; padding: 8px; color: #333;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 8px; color: #555; font-size: 12px;">${sharedNames || '—'}</td>
              </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    // Add tax info
    html += `
      <div style="margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 13px;">
        <h2 style="color: #050509; margin: 0 0 8px 0; font-size: 15px;">📊 Tax & Charges</h2>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span style="color: #666;">SGST:</span>
          <span style="color: #050509; font-weight: 600;">${taxSGST}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span style="color: #666;">CGST:</span>
          <span style="color: #050509; font-weight: 600;">${taxCGST}%</span>
        </div>
        ${tip > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid #ddd; margin-top: 4px;">
          <span style="color: #666;">Tip:</span>
          <span style="color: #050509; font-weight: 600;">₹${parseFloat(tip).toFixed(2)}</span>
        </div>
        ` : ''}
      </div>
    `;

    // Add per-person breakdown
    html += `
      <div>
        <h2 style="color: #050509; margin: 0 0 12px 0; font-size: 16px;">💳 Per-Person Breakdown</h2>
    `;

    Object.keys(bills).forEach(name => {
      const details = breakdown[name] || [];
      html += `
        <div style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 8px; border-left: 3px solid #f4c259;">
          <p style="color: #050509; font-weight: 700; margin: 0 0 8px 0; font-size: 14px;">${name}</p>
          <table style="width: 100%; font-size: 12px;">
      `;

      details.forEach(row => {
        const amount = (row.base + row.tax + row.tip + row.treatDelta).toFixed(2);
        html += `
            <tr style="color: #666;">
              <td style="padding: 2px 0;">${row.item}</td>
              <td style="text-align: right; color: #050509; font-weight: 600;">₹${amount}</td>
            </tr>
        `;
      });

      html += `
          </table>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #666;">Total:</span>
            <span style="color: #050509; font-weight: 700;">₹${bills[name].toFixed(2)}</span>
          </div>
        </div>
      `;
    });

    html += `
      </div>

      <div style="margin-top: 30px; text-align: center; color: #999; font-size: 11px;">
        <p style="margin: 0;">Generated on ${new Date().toLocaleString('en-IN')}</p>
        <p style="margin: 5px 0 0 0;">Split fairly with Baap Ka Paisa ✨</p>
      </div>
    `;

    billContent.innerHTML = html;
    document.body.appendChild(billContent);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(billContent, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add pages if content exceeds one page
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const timestamp = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      pdf.save(`bill-split-${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      document.body.removeChild(billContent);
    }
  };

  // ---------- Friends ----------

  const addFriend = () => {
    const name = newFriendName.trim();
    if (!name) {
      friendInputRef.current?.focus();
      return;
    }
    setFriends([...friends, { id: nextFriendId++, name }]);
    setNewFriendName('');
    friendInputRef.current?.focus();
  };

  const startEditFriend = (id, currentName) => {
    setEditingFriendId(id);
    setEditingFriendName(currentName);
  };

  const saveEditFriend = (id) => {
    const name = editingFriendName.trim();
    if (!name) return;
    setFriends(friends.map(f => (f.id === id ? { ...f, name } : f)));
    setEditingFriendId(null);
    setEditingFriendName('');
  };

  const deleteFriend = (id) => {
    // remove from friends
    const remainingFriends = friends.filter(f => f.id !== id);
    setFriends(remainingFriends);
    // remove from shared arrays
    const clean = (items) =>
      items.map(it => ({
        ...it,
        sharedFriendIds: it.sharedFriendIds.filter(fid => fid !== id),
      }));
    setFoodItems(clean(foodItems));
    setDrinkItems(clean(drinkItems));
  };

  // ---------- Items add / edit / delete ----------

  const addFoodItem = () => {
    const name = newFoodItemName.trim();
    const price = parseFloat(newFoodItemPrice);
    if (!name || isNaN(price)) {
      if (!name) foodNameRef.current?.focus();
      return;
    }
    setFoodItems([
      ...foodItems,
      { id: nextItemId++, name, price, sharedFriendIds: [], inclusive: false },
    ]);
    setNewFoodItemName('');
    setNewFoodItemPrice('');
    foodNameRef.current?.focus();
  };

  const addDrinkItem = () => {
    const name = newDrinkItemName.trim();
    const price = parseFloat(newDrinkItemPrice);
    if (!name || isNaN(price)) {
      if (!name) drinkNameRef.current?.focus();
      return;
    }
    setDrinkItems([
      ...drinkItems,
      { id: nextItemId++, name, price, sharedFriendIds: [], inclusive: false },
    ]);
    setNewDrinkItemName('');
    setNewDrinkItemPrice('');
    drinkNameRef.current?.focus();
  };

  const editItemName = (type, id, newName) => {
    const updater = (items) =>
      items.map(it => (it.id === id ? { ...it, name: newName } : it));
    if (type === 'food') setFoodItems(updater(foodItems));
    else setDrinkItems(updater(drinkItems));
  };

  const editItemPrice = (type, id, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;
    const updater = (items) =>
      items.map(it => (it.id === id ? { ...it, price } : it));
    if (type === 'food') setFoodItems(updater(foodItems));
    else setDrinkItems(updater(drinkItems));
  };

  const deleteItem = (type, id) => {
    if (type === 'food') setFoodItems(foodItems.filter(it => it.id !== id));
    else setDrinkItems(drinkItems.filter(it => it.id !== id));
  };

  const toggleInclusive = (type, id) => {
    const updater = (items) =>
      items.map(it => (it.id === id ? { ...it, inclusive: !it.inclusive } : it));
    if (type === 'food') setFoodItems(updater(foodItems));
    else setDrinkItems(updater(drinkItems));
  };

  const toggleShared = (type, itemId, friendId) => {
    const updater = (items) =>
      items.map(it => {
        if (it.id !== itemId) return it;
        const present = it.sharedFriendIds.includes(friendId);
        return {
          ...it,
          sharedFriendIds: present
            ? it.sharedFriendIds.filter(id => id !== friendId)
            : [...it.sharedFriendIds, friendId],
        };
      });
    if (type === 'food') setFoodItems(updater(foodItems));
    else setDrinkItems(updater(drinkItems));
  };

  const selectAll = (type, itemId) => {
    const allIds = friends.map(f => f.id);
    const updater = (items) =>
      items.map(it =>
        it.id === itemId ? { ...it, sharedFriendIds: allIds } : it
      );
    if (type === 'food') setFoodItems(updater(foodItems));
    else setDrinkItems(updater(drinkItems));
  };

  // ---------- Drag & drop ----------

  const onDragStart = (fromType, itemId) => {
    setDragInfo({ fromType, itemId });
  };

  const onDrop = (toType) => {
    if (!dragInfo) return;
    const { fromType, itemId } = dragInfo;
    if (fromType === toType) {
      setDragInfo(null);
      return;
    }
    if (fromType === 'food') {
      const item = foodItems.find(it => it.id === itemId);
      if (!item) return;
      setFoodItems(foodItems.filter(it => it.id !== itemId));
      setDrinkItems([...drinkItems, item]);
    } else {
      const item = drinkItems.find(it => it.id === itemId);
      if (!item) return;
      setDrinkItems(drinkItems.filter(it => it.id !== itemId));
      setFoodItems([...foodItems, item]);
    }
    setDragInfo(null);
  };

  // ---------- Treats ----------

  const addTreat = () => setTreats([...treats, { friendId: '', amount: '' }]);

  const updateTreat = (i, key, value) => {
    const newTreats = [...treats];
    newTreats[i][key] = value;
    setTreats(newTreats);
  };

  // ---------- Calculation (bills + breakdown) ----------

  const calculateBill = () => {
    const friendTotals = {};
    const details = {};
    friends.forEach(f => {
      friendTotals[f.name] = 0;
      details[f.name] = [];
    });

    const allItems = [
      ...foodItems.map(it => ({ ...it, type: 'Food' })),
      ...drinkItems.map(it => ({ ...it, type: 'Drink' })),
    ];

    // base share
    allItems.forEach(item => {
      const sharers = item.sharedFriendIds.length;
      if (!sharers) return;
      const baseShare = item.price / sharers;
      item.sharedFriendIds.forEach(fid => {
        const friend = friends.find(f => f.id === fid);
        if (!friend) return;
        friendTotals[friend.name] += baseShare;
        details[friend.name].push({
          item: `${item.type}: ${item.name}`,
          base: baseShare,
          tax: 0,
          tip: 0,
          treatDelta: 0,
        });
      });
    });

    // tax (only non-inclusive items)
    allItems.forEach(item => {
      if (item.inclusive) return;
      const sharers = item.sharedFriendIds.length;
      if (!sharers) return;
      const baseShare = item.price / sharers;
      const taxShare = baseShare * ((taxCGST + taxSGST) / 100);
      item.sharedFriendIds.forEach(fid => {
        const friend = friends.find(f => f.id === fid);
        if (!friend) return;
        friendTotals[friend.name] += taxShare;
        details[friend.name].push({
          item: `${item.type}: ${item.name} (tax)`,
          base: 0,
          tax: taxShare,
          tip: 0,
          treatDelta: 0,
        });
      });
    });

    // tip equally
    const tipAmount = parseFloat(tip) || 0;
    const tipPerPerson = friends.length ? tipAmount / friends.length : 0;
    friends.forEach(f => {
      friendTotals[f.name] += tipPerPerson;
      if (tipPerPerson) {
        details[f.name].push({
          item: 'Tip share',
          base: 0,
          tax: 0,
          tip: tipPerPerson,
          treatDelta: 0,
        });
      }
    });

    // treats
    treats.forEach(treat => {
      const fid = parseInt(treat.friendId, 10);
      const amount = parseFloat(treat.amount);
      if (!fid || isNaN(amount)) return;
      const friend = friends.find(f => f.id === fid);
      if (!friend) return;
      const name = friend.name;
      if (amount < friendTotals[name]) return; // not enough to cover own bill
      const excess = amount - friendTotals[name];
      friendTotals[name] = amount;
      const others = friends.filter(f => f.id !== fid);
      const reduction = others.length ? excess / others.length : 0;
      others.forEach(o => {
        friendTotals[o.name] -= reduction;
        details[o.name].push({
          item: `Treat from ${name}`,
          base: 0,
          tax: 0,
          tip: 0,
          treatDelta: -reduction,
        });
      });
      details[name].push({
        item: 'Own treat paid',
        base: 0,
        tax: 0,
        tip: 0,
        treatDelta: excess,
      });
    });

    setBills(friendTotals);
    setBreakdown(details);
  };

  // ---------- UI helpers ----------

  const friendNameById = (id) => friends.find(f => f.id === parseInt(id, 10))?.name || '';

  const toggleExpandFriend = (name) => {
    setExpandedFriend(prev => (prev === name ? null : name));
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo-circle">₹</div>
        <div>
          <h1 className="app-title">Baap Ka Paisa</h1>
          <p className="app-subtitle">Bill Splitter</p>
        </div>
      </header>

      <div className="layout-grid">
        {/* Left column --------------------------------------------------- */}
        <div>
          {/* Friends */}
          <section className="card">
            <div className="card-header">
              <span className="card-icon">👥</span>
              <h2>Friends</h2>
            </div>
            <div className="row">
              <input
                ref={friendInputRef}
                placeholder="Add friend name"
                value={newFriendName}
                onChange={e => setNewFriendName(e.target.value)}
                className="input flex-grow"
              />
              <button onClick={addFriend} className="btn-round" title="Add friend">
                +
              </button>
            </div>
            <div className="chip-row">
              {friends.map(f => (
                <div key={f.id} className="chip editable-chip">
                  {editingFriendId === f.id ? (
                    <>
                      <input
                        value={editingFriendName}
                        onChange={e => setEditingFriendName(e.target.value)}
                        className="chip-input"
                      />
                      <button
                        className="chip-icon-btn"
                        onClick={() => saveEditFriend(f.id)}
                        title="Save"
                      >
                        ✔
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{f.name}</span>
                      <button
                        className="chip-icon-btn"
                        onClick={() => startEditFriend(f.id, f.name)}
                        title="Edit"
                      >
                        ✏
                      </button>
                      <button
                        className="chip-icon-btn"
                        onClick={() => deleteFriend(f.id)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Food items */}
          <section
            className="card droppable"
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop('food')}
          >
            <div className="card-header">
              <span className="card-icon">🍽️</span>
              <h2>Food</h2>
            </div>
            <div className="row">
              <input
                ref={foodNameRef}
                placeholder="Food item name"
                value={newFoodItemName}
                onChange={e => setNewFoodItemName(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Price"
                value={newFoodItemPrice}
                onChange={e => setNewFoodItemPrice(e.target.value)}
                className="input small"
              />
              <button
                onClick={addFoodItem}
                className="btn-round"
                title="Add food item"
              >
                +
              </button>
            </div>
            {foodItems.map(item => (
              <div
                key={item.id}
                className="item-card"
                draggable
                onDragStart={() => onDragStart('food', item.id)}
              >
                <div className="item-header">
                  <span className="chip chip-outline">
                    <input
                      className="chip-inline-input"
                      value={item.name}
                      onChange={e =>
                        editItemName('food', item.id, e.target.value)
                      }
                    />
                    <span> · ₹</span>
                    <input
                      className="chip-inline-input price"
                      type="number"
                      value={item.price}
                      onChange={e =>
                        editItemPrice('food', item.id, e.target.value)
                      }
                    />
                  </span>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={item.inclusive}
                      onChange={() => toggleInclusive('food', item.id)}
                    />
                    Inclusive of tax
                  </label>
                  <button
                    onClick={() => selectAll('food', item.id)}
                    className="btn-pill"
                  >
                    Select all
                  </button>
                  <button
                    onClick={() => deleteItem('food', item.id)}
                    className="btn-icon"
                    title="Delete item"
                  >
                    🗑
                  </button>
                </div>
                <div className="checkbox-group">
                  {friends.map(fr => (
                    <label key={fr.id} className="checkbox">
                      <input
                        type="checkbox"
                        checked={item.sharedFriendIds.includes(fr.id)}
                        onChange={() =>
                          toggleShared('food', item.id, fr.id)
                        }
                      />
                      {fr.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right column -------------------------------------------------- */}
        <div>
          {/* Drink items */}
          <section
            className="card droppable"
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop('drink')}
          >
            <div className="card-header">
              <span className="card-icon">🍹</span>
              <h2>Drinks</h2>
            </div>
            <div className="row">
              <input
                ref={drinkNameRef}
                placeholder="Drink item name"
                value={newDrinkItemName}
                onChange={e => setNewDrinkItemName(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Price"
                value={newDrinkItemPrice}
                onChange={e => setNewDrinkItemPrice(e.target.value)}
                className="input small"
              />
              <button
                onClick={addDrinkItem}
                className="btn-round"
                title="Add drink item"
              >
                +
              </button>
            </div>
            {drinkItems.map(item => (
              <div
                key={item.id}
                className="item-card"
                draggable
                onDragStart={() => onDragStart('drink', item.id)}
              >
                <div className="item-header">
                  <span className="chip chip-outline">
                    <input
                      className="chip-inline-input"
                      value={item.name}
                      onChange={e =>
                        editItemName('drink', item.id, e.target.value)
                      }
                    />
                    <span> · ₹</span>
                    <input
                      className="chip-inline-input price"
                      type="number"
                      value={item.price}
                      onChange={e =>
                        editItemPrice('drink', item.id, e.target.value)
                      }
                    />
                  </span>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={item.inclusive}
                      onChange={() => toggleInclusive('drink', item.id)}
                    />
                    Inclusive of tax
                  </label>
                  <button
                    onClick={() => selectAll('drink', item.id)}
                    className="btn-pill"
                  >
                    Select all
                  </button>
                  <button
                    onClick={() => deleteItem('drink', item.id)}
                    className="btn-icon"
                    title="Delete item"
                  >
                    🗑
                  </button>
                </div>
                <div className="checkbox-group">
                  {friends.map(fr => (
                    <label key={fr.id} className="checkbox">
                      <input
                        type="checkbox"
                        checked={item.sharedFriendIds.includes(fr.id)}
                        onChange={() =>
                          toggleShared('drink', item.id, fr.id)
                        }
                      />
                      {fr.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Tax */}
          <section className="card">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <h2>Tax</h2>
            </div>
            <div className="row">
              <label className="label-inline">
                SGST (%)
                <input
                  type="number"
                  value={taxSGST}
                  onChange={e =>
                    setTaxSGST(parseFloat(e.target.value) || 0)
                  }
                  className="input small"
                />
              </label>
              <label className="label-inline">
                CGST (%)
                <input
                  type="number"
                  value={taxCGST}
                  onChange={e =>
                    setTaxCGST(parseFloat(e.target.value) || 0)
                  }
                  className="input small"
                />
              </label>
            </div>
          </section>

          {/* Treats */}
          <section className="card">
            <div className="card-header">
              <span className="card-icon">🎁</span>
              <h2>Treats</h2>
            </div>
            {treats.map((treat, i) => (
              <div key={i} className="row">
                <select
                  value={treat.friendId}
                  onChange={e =>
                    updateTreat(i, 'friendId', e.target.value)
                  }
                  className="input"
                >
                  <option value="">Select friend</option>
                  {friends.map(fr => (
                    <option key={fr.id} value={fr.id}>
                      {fr.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={treat.amount}
                  onChange={e =>
                    updateTreat(i, 'amount', e.target.value)
                  }
                  className="input small"
                />
              </div>
            ))}
            <button onClick={addTreat} className="btn-pill">
              + Add Treat
            </button>
          </section>

          {/* Tip */}
          <section className="card">
            <div className="card-header">
              <span className="card-icon">💰</span>
              <h2>Tip</h2>
            </div>
            <input
              type="number"
              placeholder="Tip amount"
              value={tip}
              onChange={e => setTip(e.target.value)}
              className="input small"
            />
          </section>

                    {/* Calculate & results */}
          <button onClick={calculateBill} className="btn-main">
            ⚖️ Calculate Split
          </button>

          {Object.keys(bills).length > 0 && (
            <button onClick={downloadPDF} className="btn-download">
              📥 Download PDF
            </button>
          )}

          <section className="card">
            <div className="card-header">
              <span className="card-icon">📜</span>
              <h2>Final Split</h2>
            </div>
            {Object.keys(bills).length === 0 && (
              <p className="muted">
                Add friends, items and hit “Calculate Split”.
              </p>
            )}
            {Object.keys(bills).map(name => (
              <div key={name}>
                <div
                  className="result-row clickable"
                  onClick={() => toggleExpandFriend(name)}
                >
                  <span>{name}</span>
                  <span>
                    ₹{bills[name].toFixed(2)}{' '}
                    <span className="caret">
                      {expandedFriend === name ? '▲' : '▼'}
                    </span>
                  </span>
                </div>
                {expandedFriend === name && (
                  <div className="breakdown">
                    {(breakdown[name] || []).map((row, idx) => (
                      <div key={idx} className="breakdown-row">
                        <span>{row.item}</span>
                        <span>
                          ₹
                          {(
                            row.base +
                            row.tax +
                            row.tip +
                            row.treatDelta
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );


}

export default App;
