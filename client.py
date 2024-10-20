import requests, json, time

class Client:
    
    """ 
        This is a simple python client to automatize the upload of Maps to NaviCell 
        
        Usage : (with this file in your path)
        
            from client import Client                       # Imports the client
            
            client = Client(<login>, <password>, [api url]) # Connects to the API with login/password. 
                                                            # Optional api url, defaults to https://navicell.vincent-noel.fr
                                                            
            maps = client.getMaps()                         # Returns a dictionnary of your maps
            
            client.uploadMap(                               # Creates a new map
                <name>, <cd_filename>, [layout],            # Requires a name, and a cell designer file
                [tags], [is_async], [image_filename]        # If an image_filename is given, the map will be created
            )                                               # from it. Otherwise it will use an automatic rendering
                                                            # A automatic layout can be activated with layout=True
                                                            # A list of strings can be given for tagging the map
                                                            # Finally, this request can be made asynchronous with is_async=True
            
            
    """
    
    def __init__(self, username, password, url=None):
        
        if url is None:
            self.url = "https://navicell.vincent-noel.fr"
        else:
            self.url = url
            
        res = None
        try:   
            res = requests.post(self.url + "/api/auth/login", data={'login': username, 'password': password})
        except:
            raise Exception("Impossible to connect !")
        
        if res is not None and res.status_code == 200:
            self.authorization = res.headers.get('Authorization')
            
        else:
            raise Exception("Impossible to connect !")
            
    def _identified_request(self, path, method="get", data={}, files={}):
        
        if method == "get":
            return requests.get(self.url + "/api/" + path, headers={
                'Authorization':  ('Bearer ' + self.authorization)
            })
        elif method == "put":
            return requests.put(self.url + "/api/" + path, headers={
                'Authorization':  ('Bearer ' + self.authorization)
            }, data=data)
            
        elif method == "post":
            return requests.post(self.url + "/api/" + path, 
                headers={
                    'Authorization':  ('Bearer ' + self.authorization), 
                },
                data=data, files=files
            )
        
        
    def getMaps(self):
        
        return json.loads(self._identified_request("maps").text)
            
    def uploadMap(self, name, cd_filename, layout=False, tags=[], is_async=False, image_filename=None):
        
        data = {
            'name': name,
            'layout': layout,
            'tags': ",".join(tags),
            'async': is_async
        }
        
        files = {
            'network-file': open(cd_filename,'rb')
        }
        
        if image_filename is not None:
            files.update({
                'image-file': open(image_filename, 'rb')
            })

        res = self._identified_request("maps", "post", data, files)
        
        if res.status_code != 201:
            print("Error : couldn't create map !")
            return
            
        if len(res.text) > 0:
            return json.loads(res.text)
    
    def uploadLayeredMap(self, name, cd_filename, layers=[], layers_nobg=[], tags=[], is_async=True):
        
        data = {
            'name': name,
            'tags': ",".join(tags),
            'async': is_async
        }
        
        files = [('network-file', open(cd_filename, 'rb'))]
        files += [('list-layers', open(image_layer, 'rb')) for image_layer in layers]
        files += [('list-layers-nobg', open(image_layer, 'rb')) for image_layer in layers_nobg]

        res = self._identified_request("maps", "post", data, files)
        
        if res.status_code != 201:
            print("Error : couldn't create map !")
            return
            
        if is_async:
            if len(res.text) > 0:
                t_map = json.loads(res.text)
        
                while self.checkIsBuilding(t_map):
                    time.sleep(10)
                    # print("Building...")
                    
                return t_map
                
        else:
            if len(res.text) > 0:
                return json.loads(res.text)
        
    
    def checkIsBuilding(self, map):
        
        res = self._identified_request("maps/" + map['id'], "get")
        return json.loads(res.text)['isBuilding']
    
    def publishMap(self, map, value=True):
        
        res = self._identified_request("maps/" + map['id'], "put", {'is_public' : "true" if value else "false"})
        if res.status_code != 200:
            print("Error : couldn't " + ("un" if not value else "") + "publish the map")