(() => {
    Object.defineProperty(
        window.navigator,
        'userAgent',
        {
            value: window.navigator.userAgent.replace(/linux/gi, "Windows")
        }
    );
})();
