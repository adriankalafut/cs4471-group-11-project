export default function resolveActiveServices(arrayOfJSON) {

    const services = {
        'live_visualization_service': false,
        'search_and_browse_service': false,
        'login_service': false,
        'notification_service': false,
    }

    arrayOfJSON.forEach(service => {
        if (service.service_name === 'live_visualization_service') {
            services['live_visualization_service'] = true;
        } else if (service.service_name === 'search_and_browse_service') {
            services['search_and_browse_service'] = true;
        } else if (service.service_name === 'login_service') {
            services['login_service'] = true;
        } else if (service.service_name === 'notification_service') {
            services['notification_service'] = true;
        }
    });
    return services;
}
