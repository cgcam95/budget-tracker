let db;

//establish a connection to IndexedDB database called budget_tracker and set version to 1
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore('budget_tracker', { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadBudgetTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["budget_tracker"], "readwrite");

  const budgetObjectStore = transaction.objectStore("budget_tracker");

  budgetObjectStore.add(record);
}

function uploadBudgetTransaction() {
  const transaction = db.transaction(["budget_tracker"], "readwrite");

  const budgetObjectStore = transaction.objectStore("budget_tracker");

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(["budget_tracker"], "readwrite");
          // access the new_pizza object store
          const budgetObjectStore = transaction.objectStore("budget_tracker");
          // clear all items in your store
          budgetObjectStore.clear();

          alert('Budget Transaction has been submitted!')
        })
        .catch(err => {
            console.log(err);
        })
    }
  };
}

// listen for app coming back online
window.addEventListener('online', uploadBudgetTransaction);