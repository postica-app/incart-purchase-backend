import { rush } from '@haechi/rush'

console.log(Deno.cwd() + '\\rush')
rush(Deno.cwd() + '\\rush', {
    port: 8000,
})
