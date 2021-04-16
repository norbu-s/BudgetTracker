let db;
// create a new db request for a "budget" database.
const request = window.indexedDB.open("buget", 1)

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("pending", { autoIncrement: true })

};

request.onsuccess = function(event) {
    db = event.target.result;


    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");

    pendingStore.add(record);
}

function checkDatabase() {

    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");

    const getAll = pendingStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json',
                    },
                })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const pendingStore = transaction.objectStore("pending");
                    pendingStore.clear();

                });
        }
    };
}

window.addEventListener('online', checkDatabase);