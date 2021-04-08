/******************************************************
 * Recovering, Storing and Deleting token in cookies  *
 ******************************************************/

let token;

function load_token() {
    
    // let token;
    
    let cookie = document.cookie;
    let cookie_values = cookie.split(";");
    
    cookie_values.map(function (t_cookie) {
    
        values = t_cookie.trim().split("=");
        if (values[0].trim() == "jwtoken") {
            token = values[1].trim();
        }
    });
    
    // return token;
}

function set_token(token) {
    document.cookie = "jwtoken="+token+"; SameSite=Strict;";

}

function unset_token() {
    document.cookie = "jwtoken= ; SameSite=Strict; expires = Thu, 01 Jan 1970 00:00:00 GMT"    
}

function logged_in() {
    return token;
}

function show_logged_in(status) {
    Array.from(document.getElementsByClassName("logged_in")).map(function (object) {
        object.style.display = status ? "block" : "none";
    });
    Array.from(document.getElementsByClassName("logged_out")).map(function (object) {
        object.style.display = status ? "none" : "block";
    });
}


async function signup(login, password) {
    let data = new FormData();
    data.append('login', login);
    data.append('password', password);
    
    // send fetch along with cookies
    let response = await fetch('/api/auth/signup', {
            method: 'POST',
            credentials: 'same-origin',
            body: data,
            // headers: new Headers(httpHeaders)
    });
    
    if(response.status === 200){
        
    }
    
}

async function login(login, password) {
    let data = new FormData();
    data.append('login', login);
    data.append('password', password);

    // send fetch along with cookies
    let response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        body: data,
        // headers: new Headers(httpHeaders)
    });

    if(response.status === 200){
        token = response.headers.get("Authorization")
    set_token(token);
    // return response.headers.get("Authorization");  
    }
      
}


async function nv3_request(url, method, body) {
    
    let httpHeaders = {};
    if (token !== undefined) {
        httpHeaders['Authorization'] = `Bearer ${token}`;
    }

    return await fetch(url, {
        method: method,
        credentials: 'same-origin',
        body: body,
        headers: new Headers(httpHeaders)   
    });
}

async function get_user() {        
    // send fetch along with cookies
    let response = await nv3_request('/api/auth/user', 'GET', null);
            
    if(response.status === 200){
        return await response.text();
    }
    
}

async function get_users() {        
    // send fetch along with cookies
    let response = await nv3_request('/api/auth/users', 'GET', null);
            
    if(response.status === 200){
        let users = await response.json();
        if (users) {
            table = document.querySelector("#table-users");
            clearTable(table);
            users.users.map((value, key) => {
              addUserToTable(table, key, value);
            });
          }
    }
    
}
async function is_root() {        
    // send fetch along with cookies
    let response = await nv3_request('/api/auth/is_root', 'GET', null);
            
    if(response.status === 200){
        let isroot = await response.text();
        return isroot === "true";
    }
    return false;
}

async function toggle_active(index, user_id) {
        
    let data = new FormData();
    data.append('is_active', document.querySelector("#active_" + index).checked);

    let response = await nv3_request(
        '/api/auth/users/' + user_id, 'PUT', data
    )

    // server responded with http response != 200
    if(response.status === 200){
    }
}
  

async function delete_user(id) {
    
    let response = await nv3_request(
        '/api/auth/users/' + id, 'DELETE', null
    );
      
    if (response.status != 200) 
        throw new Error('HTTP response code != 200')
    
    get_users();
      
  }
  
async function logout() {
    token = undefined;
    show_logged_in(logged_in());
    unset_token();
}

// async function toggle_active(user_ind, user_id) {
    
// }
  
function clearTable(table) {
    table.tBodies[0].innerHTML = "";
}

function addUserToTable(table, user_ind, user) {
    row = table.tBodies[0].insertRow();
    name_cell = row.insertCell();
    name_cell.innerText = user.name;
    active_cell = row.insertCell();
    active_cell.innerHTML = "<label class=\"switch\"><input type=\"checkbox\"/ id=\"active_" + user_ind + "\" onclick=\"toggle_active(" + user_ind + ", '" + user.id + "')\"" + (user.isActive == "true" ? " checked" : "") + "><span class=\"slider round\"></span></label>"
    active_cell = row.insertCell();
    active_cell.innerHTML = "<label class=\"switch\"><input type=\"checkbox\"/ id=\"admin_" + user_ind + "\" onclick=\"toggle_admin(" + user_ind + ", '" + user.id + "')\"" + (user.isRoot == "true" ? " checked" : "") + "><span class=\"slider round\"></span></label>"
    delete_cell = row.insertCell();
    delete_cell.style = "padding: 0.25rem";
    delete_cell.innerHTML = "<div class=\"float-right\"><button type=\"button\" class=\"btn btn-danger\" id=\"delete_" + user.id + "\">Delete</button></div>"
    
    document.querySelector("#delete_" + user.id).addEventListener('click', async function() {
        await delete_user(user.id);
    });
}


document.querySelector("#logout_button").addEventListener('click', async function() {
    logout(); 
    window.location.href = "/";  
  });
  
  
  async function refresh() {
    
    show_logged_in(logged_in()); 

    if (logged_in()) {
      let t_username = await get_user();
      console.log(t_username);
      document.querySelector("#username").innerText = t_username;
      
      let t_isroot = await is_root();
      if (t_isroot) {
        console.log("User is root")
        document.querySelector("#admin_link").style.display = "block";
      } else {
        document.querySelector("#admin_link").style.display = "none";
      }
    } else {
      document.querySelector("#username").innerText = "";
      document.querySelector("#admin_link").style.display = "none";

    }
    
    local_refresh();
   
  }
 