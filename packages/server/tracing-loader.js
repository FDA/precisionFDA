if (process.env.TRACING_ENABLED === '1') {
  require('@aws/aws-distro-opentelemetry-node-autoinstrumentation/register');
}