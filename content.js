/*************************************
 * content.js
 * 核心逻辑脚本，用于拦截回车事件
 *************************************/

/**
 * 是否开启插件功能（从 chrome.storage.sync 中读取）
 * 该变量在 onChanged 时会更新
 */
let isHandleCtrlEnterEnabled = false;

/**
 * 判断当前页面是否需要拦截回车事件
 * @param {string} url - 当前网页的 URL
 * @param {KeyboardEvent} event - 键盘事件对象
 * @returns {boolean} - 是否要处理
 */
function shouldHandleCtrlEnter(url, event) {
	if (url.startsWith("https://chat.openai.com")) {
		return event.target.tagName === "TEXTAREA";
	}

	if (url.startsWith("https://chatgpt.com")) {
		return event.target.tagName === "TEXTAREA";
	}
	return false;
}

/**
 * 判断是否需要阻止默认事件
 * 不同平台是否要 preventDefault() 以阻止原生行为，视情况而定
 * @param {string} url - 当前网页的 URL
 * @returns {boolean}
 */
function shouldPreventDefault(url) {
	if (url.startsWith("https://chat.openai.com")) {
		return true;
	}
	if (url.startsWith("https://chatgpt.com")) {
		return true;
	}
	return false;
}

/**
 * 主函数：拦截键盘事件
 */
function handleCtrlEnter(event) {
	// 看看是否在可编辑区(div#prompt-textarea)里
	const promptDiv = event.target.closest("#prompt-textarea");
	if (!promptDiv) {
		return;
	}

	// 判断是否是“Enter 且没有 Ctrl/Shift/Meta”
	const isOnlyEnter =
		event.code === "Enter" &&
		!(event.ctrlKey || event.metaKey || event.shiftKey);
	if (isOnlyEnter) {
		event.preventDefault();
		event.stopImmediatePropagation();
		// 再派发一次 Shift+Enter 事件...
		const newEvent = new KeyboardEvent("keydown", {
			key: "Enter",
			code: "Enter",
			shiftKey: true,
			bubbles: true,
			cancelable: true,
		});
		event.target.dispatchEvent(newEvent);
	}
}

/**
 * 更新 isHandleCtrlEnterEnabled 的函数
 */
function setIsEnabled(isEnabled) {
	isHandleCtrlEnterEnabled = isEnabled;
}

// 监听键盘事件（在捕获阶段），这样可尽早拦截
document.addEventListener("keydown", handleCtrlEnter, { capture: true });

// 从存储中读取是否启用
chrome.storage.sync.get("isEnabled", (data) => {
	// 如果还未设置过 isEnabled，默认启用
	const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
	setIsEnabled(isEnabled);
});

// 当用户在选项页中修改设置后，实时更新
chrome.storage.onChanged.addListener((changes, area) => {
	if (area === "sync" && changes.isEnabled) {
		setIsEnabled(changes.isEnabled.newValue);
	}
});
