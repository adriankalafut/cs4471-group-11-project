export default function availableAndSubscribedServicesIntersection(jsonArrayForAvailableServices, jsonArrayForSubscribedServices) {

    const services = {
        'live_visualization_service': false,
        'search_and_browse_service': false,
        'login_service': false,
        'notification_service': false,
    }

    for(var key in jsonArrayForAvailableServices){
      if (key === 'live_visualization_service') {
          services['live_visualization_service'] = jsonArrayForAvailableServices[key] && jsonArrayForSubscribedServices[key];

      } else if (key === 'search_and_browse_service') {
          services['search_and_browse_service'] = jsonArrayForAvailableServices[key] && jsonArrayForSubscribedServices[key];

      } else if (key === 'login_service') {
          services['login_service'] = jsonArrayForAvailableServices[key] && jsonArrayForSubscribedServices[key];

      } else if (key === 'notification_service') {
          services['notification_service'] = jsonArrayForAvailableServices[key] && jsonArrayForSubscribedServices[key];
      }
    }
    return services;
}
