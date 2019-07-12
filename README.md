# Power Europe

[demo at heroku](https://power-europe.herokuapp.com/)

This tool visualizes historic electricity production data provided by ENTSO-E.
Add Renewables Power
Based on these data, the user can simulate a past with more renewables.

We can select a day in the past and simulate the replacement of fossils by renewables. 

![real time view](https://raw.githubusercontent.com/robotnic/power-europe-angular/master/src/assets/addenergy.gif)

Try yourself
1 GWp Solar ~10 km²; 3.000.000 panels. 
1 GWp Wind ~200 * 5 MW Wind Turbine

## Energy
Electricity is only a part of the energy we need. In this tool the effect of electrified transport is shown.
![energy](https://github.com/robotnic/power-europe-angular/blob/master/src/assets/energy-transport.gif)

Replacing fossils by electricity, reduces the energy used by the customers. Please have in mind, that that's not equivalent to primary energy.
try here

## Szenarios
### Austria 15 GWp PV, 100% EV. April 2019.
In the simulation we show the load of charging vehicles as a constant value.
We don't know when the E-Cars will charge.
But our simulations shows that shifting charging time by some hours, could have a big impact.

The red area shows the additional energy needed by electric vehicles that is not coverd by renewables. The black areas are curtailed energy.

Possible conclusio:
If there is lots of PV in the system, it would be benefitial for the grid, to charge commuter vehicles during worktime.
![ev vs curtailment](https://raw.githubusercontent.com/robotnic/power-europe-angular/master/src/assets/curtailment-transport.png)
To select a single layer, try double-click.


Try
### Power2Gas
In this diagram PV and Power2Gas are dominant. Power2Gas is shown here before conversion losses. 
![pv](https://github.com/robotnic/power-europe-angular/blob/master/src/assets/pvh2.png)



try
### PV Map
How much space is needed for PV. Where do we put the installations.
![pv](https://github.com/robotnic/power-europe-angular/blob/master/src/assets/pvmap.png)

The price of PV is dropping very fast. Large scale installations will pop up in our landscape.

PV needs space. If done well, solar parks can be an eco habitates for lots of species.
PV needs less space than biofuils.

