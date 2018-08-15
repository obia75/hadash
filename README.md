# HADash
A fully customisable, stand-alone dashboard for Home Assistant with the purpose of delivering a clean, simple and easy-to-use control panel for the many people

![HADash example 1](http://matochmera.se/images/dash1.png)

![HADash example 2](http://matochmera.se/images/dash3.png)

## Requirements
- A running, accessible HA installation
- An existing web server for hosting (optional)

## Security note
If you plan to have HADash hosted on the internet then you MUST make sure to secure the config directory as it will contain the api_password for your Home Assistant installation. Preferably you keep HADash locally hosted. The location of Home Assistant is irrelevant as long as it can be reached with the configured address/port/password.

## Design constraints
Although the dashboard is highly customisable there is an overall structure of elements that can not be changed.

![HADash design](http://matochmera.se/images/ha_design.png)

1. Tab section (mandatory). Must contain at least one tab

2. Weather section (optional). Contains a primary mandatory temperature and one optional sub sensor field.

3. Date & Time section (mandatory). Uses internal date/time

4. Main section (mandatory). Consists of three layers:
 - Bottom layer (optional). Contains a repeatable image of choice
 - Middle layer (optional). Contains any image of choice
 - Top layer (mandatory). Contains entities from Home Assistant (Buttons, panels, labels, cameras)

The main section can have either a floating or grid layout. With floating you can position all entities as you wish (will be aligned over the middle layer image if specified). In the grid layout all entities will be automatically positioned in a grid.

5. Secondary section (optional). Contains clickable panels, intended for groups of entities, scripts etc. If omitted, the main section will fill the width of the screen.

6. RSS section (optional). Contains a rolling rss feed of choice.

## Element types
The entities from Home Assistant can be visualised in the following types of elements:

| Type | Description | Attributes |
| ------------- | ------------- | ------------- |
| button | Clickable rectangular button. | entity_id<br>position (x,y)<br>size (w,h)<br>icon<br>label<br>label_color<br>label_background<br>text_size |
| rounded-button | Clickable rounded button | entity_id<br>position (x,y)<br>size (w,h)<br>icon<br>label<br>label_color<br>label_background<br>text_size |
| panel | Static info panel | entity_id<br>position (x,y)<br>size (w,h)<br>title<br>unit<br>text_size |
| camera-panel | Static camera panel | entity_id<br>position (x,y)<br>size (w,h) |
| label | Static label | entity_id<br>position (x,y)<br>label_color<br>label_background<br>text_size |

## Installation
Clone the repository
```
$ git clone https://github.com/obia75/hadash.git
```
Then either copy the files to an existing web server instance or setup a simlpe docker container for it.

## Configuration
Before you can do anything you must edit the config/config.json file. This section will describe the structure of that file.

```
{
  // The settings section (mandatory as all subkeys)
  "settings": {
    "servername": "haserver.awesome.com", // Name of HA server
    "port": "8123", // HA port
    "protocol": "https", // HA protocol
    "api_password": "password", // HA API password
    // Translatable strings
    "strings": { 
      "on" : "On",
      "off": "Off",
      "brightness": "Brightness",
      "color_temp": "Color Temperature",
      "status": "Status",
      "weekdays": {
        "0": "Sun",
        "1": "Mon",
        "2": "Tue",
        "3": "Wed",
        "4": "Thu",
        "5": "Fri",
        "6": "Sat"
      },
      "months": {
        "0": "January",
        "1": "February",
        "2": "March",
        "3": "April",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "August",
        "8": "September",
        "9": "October",
        "10": "November",
        "11": "December"
      }
    }
  },
  // Layout section (mandatory)
  "layout" : {
    // Global params (mandatory)
    "global_params": {
      "bgcolor": "#161d31", // Background color in HEX
      "rssurl": "https://www.svt.se/nyheter/rss.xml" // URL of RSS feed (leave empty for none)
    },
    // Weather section (optional, remove if not used)
    "weather": { 
      // The main temperature sensor (mandatory, you can use online weather info)
      "temperature": {
        "entity_id": "sensor.weather_temperature", // Sensor entity from HA
        "unit": "&#8451;" // Unit, i.e degrees C or F
      },
      // Secondary weather sensor (optional)
      "sub_info": {
        "entity_id": "sensor.weather_wind_speed", // Sensor entity from HA
        "unit": "m/s" // Unit
      }
    }, 
    // Menu/tab section array (mandatory, at least one menu item must exist)
    "topmenu": [
      {
        "id": "tab1", // Unique tab id
        "title": "Nedanvåning", // Title of the tab
        // The content section of the tab
        "content": {
          // The main view to the left
          "mainview": {
            "bgimage": "grid.png", // The lowest layer can hold any repeatable image. Goes into the /images dir. Remove if not used
            "overlaybgimage": "bottomfloor.png", // The mid layer can contain any image, like a floor plan. Goes into the /images dir. Remove if not used
            "layout": "float", // float|grid . How items are aligned (mandatory)
            // The top layer item overlay section. Array of HA items to show
            "overlay": [
              {
                "entity_id": "switch.hall_temperature", // HA entity
                "type": "rounded-button", // button|rounded-button|label|panel|camera-panel
                "icon": "mdi-toggle-switch", // Icon. Only used on button or rounded-button. Use any from https://materialdesignicons.com/
                "label": "Friendy name", // Friendly name label. Only used on button and rounded-button (Optional)
                "label_color": "#FFFFFF", // Text color of the label (Optional)
                "label_background": "transparent", // Background color of the label (Optional)
                "text_size": "20", // Text size of the label (Optional)
                "unit": "&#8451;", // Unit. Only used on labels and panels (Optional)
                // Position of the item, only used in a floating layout
                "position": {
                  "x": "420",
                  "y": "240"
                },
                // Size of the item (in px)
                "size": {
                  "width": "50",
                  "height": "50"
                },
                "title": "Sidebrush" // Title. Only used on panels 
              }
            ]
          },
          // The seconday view to the right (optional, remove if not used in that tab)
          "rightview": {
            // The right view consist of an array of panels that you can use for controlling groups or sets of items 
            "panels": [
              {
                "entity_id": "group.all_lights_and_switches", // The HA entity
                "icon": "mdi-lightbulb-outline", // Icon. Use any from https://materialdesignicons.com/
                "title": "All lights" // Title of the panel
              }
            ]
          }
        }
      }
    ]
  }
}
```

## Supported devices
I've only tested with the devices that I currently own but as many brands work the same I assume that a lot of these will work out of the box while others requires some code changes. This is also one of the reasons for making this a public project, to get help from the community with adding support.

- Lights. Tested with IKEA Trådfri but anything that supports the standard HA on/off service should work. Also supports the brightness and color temperature attributes
- Switches. Tested with Verisure and Xiaomi plugs but anything that supports the standard HA on/off service should work
- Sensors. Tested with Verisure and Xiaomi but should work with most standard sensors
- Vacuum. Tested with Xiaomi but anything that supports the standard HA on/off service should work
- Camera. Tested with Netatmo and requires the src attribute to contain link to live image
- Scripts. Any script that supports the standard HA on/off service should work
