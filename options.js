document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("enable-checkbox");

  // 从存储读取当前状态，更新复选框
  chrome.storage.sync.get("isEnabled", (data) => {
    // 默认启用
    const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
    checkbox.checked = isEnabled;
  });

  // 监听复选框变化
  checkbox.addEventListener("change", function () {
    chrome.storage.sync.set({ isEnabled: checkbox.checked });
  });
});
