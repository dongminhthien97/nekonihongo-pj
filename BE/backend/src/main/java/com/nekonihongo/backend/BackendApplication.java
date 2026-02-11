package com.nekonihongo.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.nekonihongo.backend.service.ApplicationStateService;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	/**
	 * Component to mark application startup as complete when the application is
	 * ready.
	 * This helps handle cold start scenarios by ensuring the application is fully
	 * initialized before accepting authentication requests.
	 */
	@Component
	public static class StartupCompletionListener {

		private final ApplicationStateService applicationStateService;

		public StartupCompletionListener(ApplicationStateService applicationStateService) {
			this.applicationStateService = applicationStateService;
		}

		@EventListener(ApplicationReadyEvent.class)
		public void onApplicationReady() {
			applicationStateService.markStartupComplete();
			System.out.println("Application startup completed - ready to accept requests");
		}
	}
}
