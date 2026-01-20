require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/propagator/xray"
require "opentelemetry/instrumentation/rack"
require "opentelemetry/instrumentation/active_support"

SERVICE_NAME = ENV["OTEL_SERVICE_NAME"] || "pfda-web"

unless Rails.env.development?

  resource = OpenTelemetry::SDK::Resources::Resource.create({
    "service.name" => SERVICE_NAME,
    "deployment.environment" => Rails.env.to_s,
  })
  OpenTelemetry::SDK.configure do |config|
    config.id_generator = OpenTelemetry::Propagator::XRay::IDGenerator
    config.resource = resource

    # Sets the propagator to handle the AWS X-Ray header (X-Amzn-Trace-Id)
    config.propagators = [
      OpenTelemetry::Propagator::XRay::TextMapPropagator.new,
      OpenTelemetry::Trace::Propagation::TraceContext::TextMapPropagator.new,
    ]

    # Set the Service Name (Required for X-Ray/Jaeger visualization)
    otlp_exporter = OpenTelemetry::Exporter::OTLP::Exporter.new

    config.add_span_processor(
      OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(otlp_exporter),
    )

    # Traces incoming HTTP requests (Rack)
    config.use "OpenTelemetry::Instrumentation::Rack"
    config.use "OpenTelemetry::Instrumentation::ActionPack"

    # Traces Sidekiq jobs, linking them to the parent web request
    config.use "OpenTelemetry::Instrumentation::Sidekiq", {
      propagation_style: :child,
    }
    config.use "OpenTelemetry::Instrumentation::ActiveSupport"
  end
end
