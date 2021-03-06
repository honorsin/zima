const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
const { getAST } = require("./ast/index");
const $ = require("./js/jquery");

// Open Folder
function openFolder(location, parent, init) {
  // Check user is selected any location or not
  var folderName = location.match(/([^\/]*)\/*$/)[1];
  document.getElementById("flname").textContent = folderName;
  document.querySelector(".flname").title = location;
  if (location.length) {
    init ? localStorage.setItem("folder", location) : "";
    const content = fs.readdirSync(location);
    const container = document.getElementById("files");
    const mountDom = parent || container;
    for (let i = 0; i < content.length; i++) {
      // Check path is file or not
      if (fs.lstatSync(path.join(location, content[i])).isFile()) {
        const li = document.createElement("li");
        const el = `<img src="./static/file.png" alt="file" id="icon"><span id="name">${content[i]}</span>`;
        li.innerHTML = el;
        mountDom.appendChild(li);
        li.addEventListener("click", () => {
          localStorage.setItem("file", path.join(location, content[i]));
          refresh();
          ipcRenderer.send(
            "setWindowTitle",
            path.join(location, content[i]) + " - Text Editor"
          );
        });
        li.title = path.join(location, content[i]);
      } else {
        const li = document.createElement("li");
        const el = `<img src="./static/folder.png" alt="folder" id="icon"><span id="name">${content[i]}</span>`;
        li.innerHTML = el;
        mountDom.insertBefore(li, null);
        li.addEventListener("click", () => {
          // localStorage.setItem("folder", path.join(location, content[i]));
          openFolder(path.join(location, content[i]), li, false);
        });
        li.title = path.join(location, content[i]);
      }
    }
  } else {
    alert("Please select location for new file.");
  }
}

function refresh() {
  // Open file automatically
  let path = localStorage.getItem("file");
  if (path && path.indexOf("pkg") !== -1) {
    path = path.replace("pkg_", "");
  }
  if (path && fs.existsSync(path)) {
    if (!path.endsWith(".js")) {
      const dom = document.getElementById("content");
      const cont = fs.readFileSync(path, "utf-8");
      dom.innerText = cont;
    } else {
      try {
        progress.load_data();
        const cont = fs.readFileSync(path, "utf-8");
        const ast = getAST(cont);
        progress.generate_dom();
        var vdom_item = process_ast(ast, (ctx = {}));
        var dom = vdom_item.toDom();

        progress.finish();
        $("#content").append(dom);
        setTimeout(function () {
          $("#col-all")[0].click();
        }, 0);
      } catch (err) {
        progress.fail(err);
        throw err;
      }
    }

    ipcRenderer.send(
      "setWindowTitle",
      localStorage.getItem("file") + " - Text Editor"
    );
  }

  can_switch_horizontal_vertical_layout();
  can_collapse_expand();
  can_highlight_operator();
  hide_unnecessary_exp_brace();
  can_use_toolbar();
  can_highlight_same_identifier();
  can_open_fun_in_new_window();
  can_click_pkg_ref();

  // Open folder automatically
  if (localStorage.getItem("folder")) {
    if (fs.existsSync(localStorage.getItem("folder"))) {
      openFolder(localStorage.getItem("folder"), null, false);
    }
  }
}
// Open File
ipcRenderer.on("file", (event, location) => {
  if (location.length != 0) {
    localStorage.setItem("file", location);
    refresh();
  }
});

// Toggle Sidebar
ipcRenderer.on("sidebar", () => {
  document.querySelector(".left-edr").classList.toggle("unvisible");
});

ipcRenderer.on("openFolder", (event, location) => {
  const container = document.getElementById("files");
  container.innerHTML = ``;
  openFolder(location, null, true);
});

window.addEventListener("load", () => {
  window.refresh = refresh;
  refresh();
});
