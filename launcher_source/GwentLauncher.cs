using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace GwentClassic
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainWindow());
        }
    }

    public class MainWindow : Form
    {
        private WebView2 webView;
        private bool isFullscreen = false;
        private bool isDebugMode = false;
        private FormWindowState previousWindowState;
        private FormBorderStyle previousBorderStyle;
        private Rectangle previousBounds;

        public MainWindow()
        {
            string[] args = Environment.GetCommandLineArgs();
            for (int i = 1; i < args.Length; i++)
            {
                string a = args[i];
                if (string.Equals(a, "--debug", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(a, "-d", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(a, "--dev", StringComparison.OrdinalIgnoreCase))
                {
                    isDebugMode = true;
                }
            }

            this.Text = isDebugMode ? "Gwent Classic [DEBUG]" : "Gwent Classic";
            this.BackColor = Color.FromArgb(13, 15, 18);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Size = new Size(1366, 800);
            this.MinimumSize = new Size(960, 540);

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string iconPath = Path.Combine(appDir, "app.ico");
            if (File.Exists(iconPath))
            {
                try
                {
                    this.Icon = new Icon(iconPath);
                }
                catch { }
            }

            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            webView.DefaultBackgroundColor = Color.FromArgb(13, 15, 18);
            this.Controls.Add(webView);

            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            try
            {
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string userDataFolder = Path.Combine(localAppData, "GwentClassic", "WebView2Data");
                Directory.CreateDirectory(userDataFolder);

                var options = new CoreWebView2EnvironmentOptions("--autoplay-policy=no-user-gesture-required --disable-features=Translate");
                var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder, options);
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.IsStatusBarEnabled = isDebugMode;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = isDebugMode;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.Settings.IsZoomControlEnabled = isDebugMode;

                webView.CoreWebView2.WindowCloseRequested += (s, e) => this.Close();
                webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;

                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "gwent.local",
                    appDir,
                    CoreWebView2HostResourceAccessKind.Allow
                );

                if (isDebugMode)
                {
                    webView.CoreWebView2.OpenDevToolsWindow();
                    webView.CoreWebView2.Navigate("http://gwent.local/index.html?dev=1");
                }
                else
                {
                    webView.CoreWebView2.Navigate("http://gwent.local/index.html");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao inicializar WebView2:\n" + ex.Message, "Erro - Gwent Classic", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OnWebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                string msg = e.TryGetWebMessageAsString();
                if (string.IsNullOrEmpty(msg)) return;

                if (msg == "quit")
                {
                    this.Close();
                }
                else if (msg == "display:fullscreen" || msg == "display:borderless")
                {
                    SetDisplayMode("fullscreen");
                }
                else if (msg == "display:window")
                {
                    SetDisplayMode("window");
                }
                else if (msg.StartsWith("resolution:"))
                {
                    string[] parts = msg.Substring(11).Split('x');
                    if (parts.Length == 2)
                    {
                        int w = int.Parse(parts[0]);
                        int h = int.Parse(parts[1]);
                        SetResolution(w, h);
                    }
                }
            }
            catch { }
        }

        private void SetDisplayMode(string mode)
        {
            if (mode == "fullscreen" || mode == "borderless")
            {
                if (!isFullscreen)
                {
                    previousWindowState = this.WindowState;
                    previousBorderStyle = this.FormBorderStyle;
                    previousBounds = this.Bounds;
                }
                this.FormBorderStyle = FormBorderStyle.None;
                this.WindowState = FormWindowState.Normal;
                this.Bounds = Screen.FromControl(this).Bounds;
                isFullscreen = true;
            }
            else
            {
                this.FormBorderStyle = FormBorderStyle.Sizable;
                this.WindowState = FormWindowState.Normal;
                this.CenterToScreen();
                isFullscreen = false;
            }
        }

        private void SetResolution(int w, int h)
        {
            if (!isFullscreen)
            {
                this.ClientSize = new Size(w, h);
                this.CenterToScreen();
            }
        }

        private void ToggleFullscreen()
        {
            if (!isFullscreen)
            {
                SetDisplayMode("fullscreen");
            }
            else
            {
                SetDisplayMode("window");
            }
        }

        protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
        {
            if (keyData == Keys.F11)
            {
                ToggleFullscreen();
                return true;
            }
            if (keyData == Keys.Escape && isFullscreen)
            {
                ToggleFullscreen();
                return true;
            }
            if (keyData == Keys.F5 || keyData == (Keys.Control | Keys.R))
            {
                if (webView != null && webView.CoreWebView2 != null)
                {
                    webView.CoreWebView2.Reload();
                    return true;
                }
            }
            if (keyData == Keys.F12 || keyData == (Keys.Control | Keys.Shift | Keys.I))
            {
                if (webView != null && webView.CoreWebView2 != null)
                {
                    webView.CoreWebView2.OpenDevToolsWindow();
                    return true;
                }
            }
            return base.ProcessCmdKey(ref msg, keyData);
        }
    }
}
