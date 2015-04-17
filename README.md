# JSFlags-ai

## About
JSFlags-ai is a dummy AI that connects to a [JSFlags](https://github.com/erceth/jsflags) server.  This code is supposed to be greatly expanded by a hackathon member.  Currently the AI sends each tank to a random base repeatedly.  The tanks shoot every few seconds.

## How to set up
- Download JSFlags-ai and add your awesome AI code.
- Download and run [JSFlags](https://github.com/erceth/jsflags).
- run JSFlags-ai and connect it to the JSFlags server (i.e. node index.js 0).
- open Chrome tab to port specified in JSFlags and watch your AI be amazing.

## Demo
Here is a demo [http://www.jsflags.ericethington.com](http://www.jsflags.ericethington.com/)

## The gameState object
- 60 times per second jsflags returns a gameState object on "refresh" event
- The gameState object contains the positions of all the tanks, flags and properties about them.
- It's honestly more information than you need.  Much of it is for the view to display in Chrome.
- To create a proper AI you must use the info from the gameState.
- Here's an example gameState object:
```
{
    "tanks": [
        {
            "type": "tank",
            "color": "red",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 0,
            "base": {
                "position": {
                    "x": 350,
                    "y": 60
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 213.49065744592747,
                "y": 25.551259935793734
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 213.49065744592747,
                "y": 25.551259935793734
            },
            "angle": 137.27521581575274,
            "angleVel": -1,
            "speed": 1,
            "radians": 2.3959
        },
        {
            "type": "tank",
            "color": "red",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 1,
            "base": {
                "position": {
                    "x": 350,
                    "y": 60
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 87.16725642933973,
                "y": 314.3266781987814
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 87.77093211280082,
                "y": 313.5294482011033
            },
            "angle": 127.13134078867733,
            "angleVel": 1,
            "speed": 1,
            "radians": 2.2189
        },
        {
            "type": "tank",
            "color": "red",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 2,
            "base": {
                "position": {
                    "x": 350,
                    "y": 60
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 0.9858374315553413,
                "y": -0.16770378214091602
            },
            "dead": true,
            "ghost": true,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 0,
                "y": 0
            },
            "angle": -9.655708147212863,
            "angleVel": -1,
            "speed": 1,
            "radians": -0.1685
        },
        {
            "type": "tank",
            "color": "red",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 3,
            "base": {
                "position": {
                    "x": 350,
                    "y": 60
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 86.7104006931556,
                "y": 337.5639533769652
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 87.682496065259,
                "y": 337.3293673851942
            },
            "angle": 166.43483839929104,
            "angleVel": -1,
            "speed": 1,
            "radians": 2.9048
        },
        {
            "type": "tank",
            "color": "blue",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 0,
            "base": {
                "position": {
                    "x": 60,
                    "y": 350
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": -0.3148408578939048,
                "y": 0.9491444748828441
            },
            "dead": true,
            "ghost": true,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": false,
            "position": {
                "x": 0,
                "y": 0
            },
            "angle": -251.64955031126738,
            "angleVel": -1,
            "speed": 1,
            "radians": -4.3921
        },
        {
            "type": "tank",
            "color": "blue",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 1,
            "base": {
                "position": {
                    "x": 60,
                    "y": 350
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 68.59307408890892,
                "y": 332.64476443764187
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 67.66016935223735,
                "y": 332.2846411916611
            },
            "angle": 21.106691667810082,
            "angleVel": 1,
            "speed": 1,
            "radians": 0.3684
        },
        {
            "type": "tank",
            "color": "blue",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 2,
            "base": {
                "position": {
                    "x": 60,
                    "y": 350
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 0.9397885352376991,
                "y": 0.34175650547689657
            },
            "dead": true,
            "ghost": true,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": false,
            "position": {
                "x": 0,
                "y": 0
            },
            "angle": -340.01796627417207,
            "angleVel": -1,
            "speed": 1,
            "radians": -5.9344
        },
        {
            "type": "tank",
            "color": "blue",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 3,
            "base": {
                "position": {
                    "x": 60,
                    "y": 350
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": -0.5940656889619009,
                "y": 0.804416532151237
            },
            "dead": true,
            "ghost": true,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 0,
                "y": 0
            },
            "angle": 126.44333624280989,
            "angleVel": -1,
            "speed": 1,
            "radians": 2.2069
        },
        {
            "type": "tank",
            "color": "green",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 0,
            "base": {
                "position": {
                    "x": 640,
                    "y": 350
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 213.78375072333333,
                "y": 290.39303326045604
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 213.78375072333333,
                "y": 290.39303326045604
            },
            "angle": 134.7600885592401,
            "angleVel": 1,
            "speed": 1,
            "radians": 2.352
        },
        {
            "type": "tank",
            "color": "green",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 1,
            "base": {
                "position": {
                    "x": 640,
                    "y": 350
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 627.2363771111985,
                "y": 300.0610007959945
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 627.2363771111985,
                "y": 300.0610007959945
            },
            "angle": 230.9104806445539,
            "angleVel": -1,
            "speed": 1,
            "radians": 4.0301
        },
        {
            "type": "tank",
            "color": "green",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 2,
            "base": {
                "position": {
                    "x": 640,
                    "y": 350
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 602.2802351810082,
                "y": 418.10236701064997
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 602.2802351810082,
                "y": 418.10236701064997
            },
            "angle": 149.41674438491464,
            "angleVel": -1,
            "speed": 1,
            "radians": 2.6078
        },
        {
            "type": "tank",
            "color": "green",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 3,
            "base": {
                "position": {
                    "x": 640,
                    "y": 350
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": -0.19524149044391553,
                "y": -0.9807551990222833
            },
            "dead": true,
            "ghost": true,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": false,
            "position": {
                "x": 0,
                "y": 0
            },
            "angle": -101.25921562500298,
            "angleVel": -1,
            "speed": 1,
            "radians": -1.7673
        },
        {
            "type": "tank",
            "color": "purple",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 0,
            "base": {
                "position": {
                    "x": 350,
                    "y": 640
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": -0.3189331814140498,
                "y": 0.9477772026130997
            },
            "dead": true,
            "ghost": true,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 0,
                "y": 0
            },
            "angle": 108.59926392883062,
            "angleVel": 1,
            "speed": 1,
            "radians": 1.8954
        },
        {
            "type": "tank",
            "color": "purple",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 1,
            "base": {
                "position": {
                    "x": 350,
                    "y": 640
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 334.03665283905667,
                "y": 667.4270966793002
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 334.03665283905667,
                "y": 667.4270966793002
            },
            "angle": 68.12727687694132,
            "angleVel": -1,
            "speed": 1,
            "radians": 1.189
        },
        {
            "type": "tank",
            "color": "purple",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 2,
            "base": {
                "position": {
                    "x": 350,
                    "y": 640
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 0.13696444571153102,
                "y": -0.9905759640789459
            },
            "dead": true,
            "ghost": true,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 0,
                "y": 0
            },
            "angle": -82.12960851565003,
            "angleVel": -1,
            "speed": 1,
            "radians": -1.4334
        },
        {
            "type": "tank",
            "color": "purple",
            "size": {
                "height": 20,
                "width": 20
            },
            "tankNumber": 3,
            "base": {
                "position": {
                    "x": 350,
                    "y": 640
                },
                "size": {
                    "height": 100,
                    "width": 100
                }
            },
            "positionStep": {
                "x": 299.8334272166819,
                "y": 690.1316790099771
            },
            "dead": false,
            "ghost": false,
            "hasFlag": false,
            "dimensions": {
                "width": 700,
                "height": 700
            },
            "reloading": true,
            "position": {
                "x": 299.8334272166819,
                "y": 689.7773466578542
            },
            "angle": 20.75520981475711,
            "angleVel": -1,
            "speed": 1,
            "radians": 0.3622
        }
    ],
    "boundaries": [],
    "bullets": [
        {
            "type": "bullet",
            "size": {
                "height": 6,
                "width": 6
            },
            "color": "green",
            "tankSize": {
                "height": 20,
                "width": 20
            },
            "speed": 5,
            "radians": 4.5887,
            "position": {
                "x": 617.6693356821692,
                "y": 150.38279194040365
            },
            "positionStep": {
                "x": 617.6693356821692,
                "y": 150.38279194040365
            },
            "dead": false
        }
    ],
    "flags": [
        {
            "type": "flag",
            "originalPosition": {
                "x": 350,
                "y": 60
            },
            "position": {
                "x": 350,
                "y": 60
            },
            "size": {
                "height": 19,
                "width": 19
            },
            "color": "red",
            "tankToFollow": null
        },
        {
            "type": "flag",
            "originalPosition": {
                "x": 60,
                "y": 350
            },
            "position": {
                "x": 60,
                "y": 350
            },
            "size": {
                "height": 19,
                "width": 19
            },
            "color": "blue",
            "tankToFollow": null
        },
        {
            "type": "flag",
            "originalPosition": {
                "x": 640,
                "y": 350
            },
            "position": {
                "x": 640,
                "y": 350
            },
            "size": {
                "height": 19,
                "width": 19
            },
            "color": "green",
            "tankToFollow": null
        },
        {
            "type": "flag",
            "originalPosition": {
                "x": 350,
                "y": 640
            },
            "position": {
                "x": 350,
                "y": 640
            },
            "size": {
                "height": 19,
                "width": 19
            },
            "color": "purple",
            "tankToFollow": null
        }
    ],
    "score": {
        "red": {
            "color": "red",
            "score": 0
        },
        "blue": {
            "color": "blue",
            "score": 0
        },
        "green": {
            "color": "green",
            "score": 0
        },
        "purple": {
            "color": "purple",
            "score": 0
        }
    }
}
```
